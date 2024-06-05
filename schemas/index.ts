import *  as z from 'zod'

export const newPasswordSchema = z.object({
  password: z.string().min(6, {
    message: "Minimum of 6 characters require!"
  }),
})

export const resetSchema = z.object({
  email: z.string().email({ message: "Email is required." }),
})

export const loginSchema = z.object({
  email: z.string().email({ message: "Email is required." }),
  password: z.string().min(1, {
    message: "Password is required."
  })
})

export const registerSchema = z.object({
  email: z.string().email({ message: "Email is required." }),
  password: z.string().min(6, {
    message: "Password must be 6 characters."
  }),
  name: z.string().min(1, {
    message: "Name is required"
  })
})