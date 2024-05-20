import Credentials from "next-auth/providers/credentials"
import github from "next-auth/providers/github"
import google from "next-auth/providers/google"

import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter" 
import { prisma } from "./lib/db"
import bcrypt from 'bcryptjs'

import { loginSchema } from "./schemas"
import { getUserByEmail } from "./data/user"
import { getUserById } from "./data/user"
import { UserRole } from "@prisma/client"
 
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  callbacks: {
    // async signIn({ user }){
    //   const existingUser = await getUserById(user.id as string)

    //   if(!existingUser || !existingUser.emailVerified){
    //     return false
    //   }

    //   return true
    // },
    async session({ token, session }){
      if(token.sub && session.user){
        session.user.id = token.sub
      }

      if(token.role && session.user){
        session.user.role = token.role as UserRole
      }
      return session
    },
    async jwt({ token }){
      if(!token.sub){
        return token
      }

      const user = await getUserById(token.sub)

      if(!user){
        return token
      }

      token.role = user.role

      return token
    }
  },
  session: { strategy: 'jwt' },
  providers: [
    github({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET
    }),
    google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRECT
    }),
    Credentials({
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