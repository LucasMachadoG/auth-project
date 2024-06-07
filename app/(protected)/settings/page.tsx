'use client'

import { Logout } from "@/app/_actions/logout"
import { useCurrentUser } from "@/hooks/use.current.user"

export default function Settings(){
  const user = useCurrentUser()

  const onClick = () => {
    Logout()
  }

  return(
    <div className="bg-white p-4 rounded-xl">
      <button onClick={onClick} type="button">
        Sign out
      </button>
    </div>
  )
}