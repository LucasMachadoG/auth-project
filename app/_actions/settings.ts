'use server'

import { currentUser } from "@/lib/auth";
import { settingsSchema } from "@/schemas";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { getUserByEmail, getUserById } from "@/data/user";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/mail";
import bcrypt from 'bcryptjs'

export async function Settings(values: z.infer<typeof settingsSchema>){
  const user = await currentUser()

  if(!user){
    return{
      error: "Unauthorized!"
    }
  }

  const dbUser = await getUserById(user.id as string) 

  if(!dbUser){
    return {
      error: "Unauthorized!"
    }
  }

  if(user.isOAuth){
    values.email = undefined
    values.password = undefined
    values.newPassword = undefined
    values.isTwoFactorEnable = undefined
  }

  if(values.email && values.email !== user.email){
    const existingUser = await getUserByEmail(values.email)

    if(existingUser && existingUser.id !== user.id){
      return {
        error: "Email already in user!"
      }
    }

    const verificationToken = await generateVerificationToken(values.email)

    await sendVerificationEmail(verificationToken.email, verificationToken.token)

    return {
      success: "Verification email sent!"
    }
  }

  if(values.password && values.newPassword && dbUser.password){
    const passwordMatch = await bcrypt.compare(values.password, dbUser.password)

    if(!passwordMatch){
      return {
        error: "Incorrect password!"
      }
    }

    const hashedPassword = await bcrypt.hash(values.newPassword, 8)

    values.password = hashedPassword
    values.newPassword = undefined
  }

  await prisma.user.update({
    where: {
      id: dbUser.id
    },
    data: {
      ...values
    }
  })

  return {
    success: "Settings update!"
  }
}