'use server'

import { compare } from 'bcryptjs'
import { loginSchema } from '@/schemas'
import { prisma } from '@/lib/db'
import * as z from 'zod'
import { signIn } from '@/auth'
import { DEFAULT_LOGIN_REDIRECT } from '@/routes'
import { AuthError } from 'next-auth'
import { getUserByEmail } from '@/data/user'
import { sendVerificationEmail, sendTwoFactorTokenEmail } from '@/lib/mail'
import { generateTwoFactorToken, generateVerificationToken } from '@/lib/tokens'
import { getTwoFactorTokenByEmail } from '@/data/two.factor.token'
import { getTwoFactorConfirmationByUserId } from '@/data/two.factor.confirmation'

export async function Login(values: z.infer<typeof loginSchema>){
  const validatedFields = loginSchema.safeParse(values)

  if(!validatedFields.success){
    return{
      error: "Invalid fields."
    }
  }

  const { email, password, code } = validatedFields.data

  const existingUser = await getUserByEmail(email)

  if(!existingUser || !existingUser.email || !existingUser.password){
    console.log("Aqui")

    return {
      error: "Email does not exist."
    }
  }

  const isPasswordValid = await compare(password, existingUser.password)

  if (!isPasswordValid) {
    return {
      error: "Invalid credentials."
    }
  }

  if(!existingUser.emailVerified){
    const verificationToken = await generateVerificationToken(existingUser.email)

    await sendVerificationEmail(verificationToken.email, verificationToken.token)

    return {
      success: "Confirmation email sent."
    }
  }

  if(existingUser.isTwoFactorEnable && existingUser.email){
    if(code){
      console.log({
        CODE: code
      })

      const twoFactorToken = await  getTwoFactorTokenByEmail(existingUser.email)

      if(!twoFactorToken){
        return {
          error: "Invalid code!"
        }
      }

      if(twoFactorToken.token !== code){
        return {
          error: "Invalid code!"
        }
      }

      const hasExpires = new Date(twoFactorToken.expires) < new Date()

      if(hasExpires){
        return {
          error: "Code expired!"
        }
      }

      await prisma.twoFactorToken.delete({
        where: {
          id: twoFactorToken.id
        }
      })

      const existingConfirmation = await getTwoFactorConfirmationByUserId(existingUser.id)

      if(existingConfirmation){
        await prisma.twoFactorConfirmation.delete({
          where: {
            id: existingConfirmation.id
          }
        })
      }

      await prisma.twoFactorConfirmation.create({
        data: {
          userId: existingUser.id
        }
      })
    } else {
      const twoFactorToken = await generateTwoFactorToken(existingUser.email)

      await sendTwoFactorTokenEmail(twoFactorToken.email, twoFactorToken.token)
  
      return {
        twoFactor: true
      }
    }
  }

  try{
    await signIn('credentials', {
      email,
      password,
      redirectTo: DEFAULT_LOGIN_REDIRECT
    })

    return {
      success: "Login successfully"
    }
  }catch(error: any){
    if(error instanceof AuthError){
      switch (error.type){
        case "CredentialsSignin": 
          return {
            error: "Invalid credentials."
          }
        default: {
          return {
            error: "Something went wrong."
          }
        }
      }
    }

    throw error
  }
}