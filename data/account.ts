import { prisma } from "@/lib/db";

export async function getAccountByUserId(userId: string){
  try{
    const account = await prisma.account.findFirst({
      where: {
        userId
      }
    })

    return account
  } catch(error: any){
    return null
  }
}