import { prisma } from '@/lib/db'

export async function getTwoFactorTokenByToken(token: string){
  try{
    const twoFactorToken = await prisma.twoFactorToken.findUnique({
      where: {
        token
      }
    })

    return token
  } catch(error: any){
    return null
  }
}

export async function getTwoFactorTokenByEmail(email: string){
  try{
    const twoFactorToken = await prisma.twoFactorToken.findFirst({
      where: {
        email
      }
    })

    return twoFactorToken
  } catch(error: any){
    return null
  }
}