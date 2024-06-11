'use client'

import * as z from 'zod'

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState, useTransition } from 'react'

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form" 
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot, } from "@/components/ui/input-otp"
import { Input } from '../ui/input'
import { Button } from '../ui/button'

import { CardWrapper } from "./card.wrapper"
import { loginSchema } from '@/schemas'
import { FormError } from '../form.error'
import { FormSuccess } from '../form.success'
import { Login } from '@/app/_actions/login'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export function LoginForm(){
  const searchParams = useSearchParams()
  const urlError = searchParams.get("error") === "OAuthAccountNotLinked" ? "Email already in use." : ""

  const [errorMessage, setErrorMessage] = useState<string | undefined>('')
  const [successMessage, setSuccessMessage] = useState<string | undefined>('')
  const [isPending, startTransition] = useTransition()
  const [showTwoFactor, setShowTwoFactor] = useState(false)

  const callbackUrl = searchParams.get("callbackUrl")

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      code: ""
    }
  })

  const onSubmit = (values: z.infer<typeof loginSchema>) => {
    setErrorMessage("")
    setSuccessMessage("")

    startTransition(async () => {
      const result = await Login(values, callbackUrl)

      if(result?.error){
        form.reset()
        setErrorMessage(result.error)
        return
      }

      if(result.success){
        form.reset()
        setSuccessMessage(result.success)
        return
      }

      if(result.twoFactor){
        setShowTwoFactor(true)
      }
    })
  }

  return(
    <CardWrapper 
      headerLabel="Welcome back"
      backButtonLabel="Don't have an account?"
      backButtonHref="/auth/register"
      showSocial
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
          <div className='space-y-4'>
            {showTwoFactor && (
              <div className='w-full flex justify-center'>
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Code
                      </FormLabel>
                      <FormControl>
                        <InputOTP 
                          {...field}
                          maxLength={6}
                        >
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                          </InputOTPGroup>
                          <InputOTPSeparator />
                          <InputOTPGroup>
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
               
             </div>           
            )}
            {!showTwoFactor && (
              <>
                <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        disabled={isPending}
                        placeholder='john.doe@example.com'
                        type='email'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Password
                    </FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        disabled={isPending}
                        placeholder='******'
                        type='password'
                      />
                    </FormControl>
                    <Button size={'sm'} variant={'link'} asChild className='px-0 font-normal'>
                      <Link href={"/auth/reset"}>Forgot password?</Link>
                    </Button>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>)}
            
          </div>
          <FormError message={errorMessage || urlError} />
          <FormSuccess message={successMessage} />
          <Button
            disabled={isPending}
            type='submit'
            className='w-full'
          >
            {showTwoFactor ? "Confirm" : "Login"}
          </Button>
        </form>
      </Form>
    </CardWrapper>
  )
}