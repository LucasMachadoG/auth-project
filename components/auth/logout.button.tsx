'use client'

import { Logout } from "@/app/_actions/logout"

interface LogoutButtonProps{
  children: React.ReactNode
}

export default function LogoutButton({ children }: LogoutButtonProps){
  const onClick = () => {
    Logout()
  }
  
  return(
    <span onClick={onClick} className="cursor-pointer">
      {children}
    </span>
  )
}