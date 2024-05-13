'use server'

import { loginSchema } from '@/schemas'
import * as z from 'zod'

export async function Login(values: z.infer<typeof loginSchema>){
  const validatedFields = loginSchema.safeParse(values)

  if(!validatedFields.success){
    return{
      error: "Invalid fields."
    }
  }

  return {
    success: "Email sent."
  }
}