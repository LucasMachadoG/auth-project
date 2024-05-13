'use client'

import * as z from 'zod'

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState, useTransition } from 'react'

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form" 
import { Input } from '../ui/input'
import { Button } from '../ui/button'

import { CardWrapper } from "./card.wrapper"
import { loginSchema } from '@/schemas'
import { FormError } from '../form.error'
import { FormSuccess } from '../form.success'
import { Login } from '@/app/_actions/login'

export function LoginForm(){
  const [errorMessage, setErrorMessage] = useState<string | undefined>('')
  const [successMessage, setSuccessMessage] = useState<string | undefined>('')
  const [isPending, starTransition] = useTransition()

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  })

  const onSubmit = (values: z.infer<typeof loginSchema>) => {
    setErrorMessage("")
    setSuccessMessage("")

    starTransition(async () => {
      const result = await Login(values)

      if(result.error){
        setErrorMessage(result.error)
        return
      }

      setSuccessMessage(result.success)
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
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormError message={errorMessage} />
          <FormSuccess message={successMessage} />
          <Button
            disabled={isPending}
            type='submit'
            className='w-full'
          >
            Login
          </Button>
        </form>
      </Form>
    </CardWrapper>
  )
}