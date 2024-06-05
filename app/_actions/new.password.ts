'use server'

import bcrypt from 'bcryptjs'
import { getPasswordResetTokenByToken } from '@/data/password.reset.token'
import { getUserByEmail } from '@/data/user'
import { newPasswordSchema } from '@/schemas'
import { z } from 'zod'
import { prisma } from '@/lib/db'

export async function NewPassword(values: z.infer<typeof newPasswordSchema>, token: string){
  if(!token){
    return {
      error: "Missing token!"
    }
  }

  const validatedFields = newPasswordSchema.safeParse(values)

  if(!validatedFields.success){
    return {
      error: "Invalid fields!"
    }
  }

  const { password } = validatedFields.data

  const existingToken = await getPasswordResetTokenByToken(token)
  
  if(!existingToken){
    return {
      error: "Invalid token!"
    }
  }

  const hasExpired = new Date(existingToken.expires) < new Date()

  if(hasExpired){
    return {
      error: "Token has expires!"
    }
  }

  const existingUser = await getUserByEmail(existingToken.email)

  if(!existingUser){
    return {
      error: "Email does not exist!"
    }
  }

  const hashPassword = await bcrypt.hash(password, 8)

  await prisma.user.update({
    where: {
      id: existingUser.id
    },
    data: {
      password: hashPassword
    }
  })

  await prisma.passwordResetToken.delete({
    where: {
      id: existingToken.id
    }
  })

  return {
    success: "Password update!"
  }
}