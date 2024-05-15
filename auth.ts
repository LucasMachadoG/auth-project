import Credentials from "next-auth/providers/credentials"

import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter" 
import { prisma } from "./lib/db"
import bcrypt from 'bcryptjs'

import { loginSchema } from "./schemas"
import { getUserByEmail } from "./data/user"
 
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  providers: [Credentials({
    async authorize(credentials){
      const validatedFields = loginSchema.safeParse(credentials)

      if(validatedFields.success){
        const { email, password } = validatedFields.data

        const user = await getUserByEmail(email)

        if(!user || !user.password){
          return null
        }

        const passwordMatch = await bcrypt.compare(password, user.password)

        if(passwordMatch){
          return user
        }
      }

      return null
    }
  })],
})