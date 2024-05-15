'use server'

import { registerSchema } from '@/schemas'
import * as z from 'zod'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { getUserByEmail } from '@/data/user'

export async function Register(values: z.infer<typeof registerSchema>){
  const validatedFields = registerSchema.safeParse(values)

  if(!validatedFields.success){
    return{
      error: "Invalid fields."
    }
  }

  const { email, name, password } = validatedFields.data

  const userWithEmailAlreadyExists = await getUserByEmail(email)

  console.log(userWithEmailAlreadyExists)

  if(userWithEmailAlreadyExists){
    return{
      error: "Email already exists."
    }
  }

  const hashPassword =  await bcrypt.hash(password, 8)

  await prisma.user.create({
    data: {
      email,
      name,
      password: hashPassword
    }
  })

  return {
    success: "User created."
  }
}