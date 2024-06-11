// export { auth as middleware } from "@/auth"
import { NextResponse } from "next/server"
import { auth } from "./auth"

import { DEFAULT_LOGIN_REDIRECT, apiAuthPrefix, authRoutes, publicRoutes } from "./routes"

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth

  const isApiAuthRoutes = nextUrl.pathname.startsWith(apiAuthPrefix)
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname)
  const isAuthRoutes = authRoutes.includes(nextUrl.pathname)

  if(isApiAuthRoutes){
    return Promise.resolve()
  }

  if(isAuthRoutes){
    if(isLoggedIn){
      return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl))
    }
    return Promise.resolve()
  }
  
  if(!isLoggedIn && !isPublicRoute){
    let callbackUrl = nextUrl.pathname

    if(nextUrl.search){
      callbackUrl += nextUrl.search
    }

    const encodedCallBackUrl = encodeURIComponent(callbackUrl)
    return NextResponse.redirect(new URL(`/auth/login?callbackUrl=${encodedCallBackUrl}`, nextUrl))
  }

  return Promise.resolve()
})

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};