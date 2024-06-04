'use server'

import { getUserByEmail } from "@/data/user"
import { resetSchema } from "@/schemas"
import { z } from "zod"

export async function Reset(values: z.infer<typeof resetSchema>){
  const validatedFields = resetSchema.safeParse(values)

  if(!validatedFields.success){
    return {
      error: "Invalid email!"
    }
  }

  const { email } = validatedFields.data

  const existingUser = await getUserByEmail(email)

  if(!existingUser){
    return {
      error: "Email not found"
    }
  }

  return {
    success: "Reset email sent"
  }
}