'use server'

import { currentRole } from "@/lib/auth"
import { UserRole } from "@prisma/client"
import { error } from "console"

export async function Admin(){
  const role = await currentRole()

  if(role === UserRole.ADMIN){
    return {
      error: "Forbidden!"
    }
  }

  return {
    success: "Allowed!"
  }
}