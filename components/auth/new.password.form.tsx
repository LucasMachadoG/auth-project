'use client'

import * as z from 'zod'

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState, useTransition } from 'react'

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form" 
import { Input } from '../ui/input'
import { Button } from '../ui/button'

import { CardWrapper } from "./card.wrapper"
import { newPasswordSchema } from '@/schemas'
import { FormSuccess } from '../form.success'
import { FormError } from '../form.error'
import { useSearchParams } from 'next/navigation'
import { NewPassword } from '@/app/_actions/new.password'

export function NewPasswordForm(){
  const [errorMessage, setErrorMessage] = useState<string | undefined>('')
  const [successMessage, setSuccessMessage] = useState<string | undefined>('')
  const [isPending, starTransition] = useTransition()

  const searchParams = useSearchParams()

  const token = searchParams.get("token")

  const form = useForm<z.infer<typeof newPasswordSchema>>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: {
      password: "",
    }
  })

  const onSubmit = (values: z.infer<typeof newPasswordSchema>) => {
    setErrorMessage("")
    setSuccessMessage("")

    console.log(values)

    starTransition(async () => {
      const result = await NewPassword(values, token as string)

      if(result?.error){
        setErrorMessage(result.error)
        return
      }

      setSuccessMessage(result.success)
    })
  }

  return(
    <CardWrapper 
      headerLabel="Enter a new password."
      backButtonLabel="Back to login"
      backButtonHref="/auth/login"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
          <div className='space-y-4'>
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
            Reset password
          </Button>
        </form>
      </Form>
    </CardWrapper>
  )
}