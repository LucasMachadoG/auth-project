'use client'

import * as z from 'zod'

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState, useTransition } from 'react'

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form" 
import { Input } from '../ui/input'
import { Button } from '../ui/button'

import { CardWrapper } from "./card.wrapper"
import { resetSchema } from '@/schemas'
import { FormSuccess } from '../form.success'
import { FormError } from '../form.error'
import { Reset } from '@/app/_actions/reset'

export function ResetForm(){
  const [errorMessage, setErrorMessage] = useState<string | undefined>('')
  const [successMessage, setSuccessMessage] = useState<string | undefined>('')
  const [isPending, starTransition] = useTransition()

  const form = useForm<z.infer<typeof resetSchema>>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      email: "",
    }
  })

  const onSubmit = (values: z.infer<typeof resetSchema>) => {
    setErrorMessage("")
    setSuccessMessage("")

    console.log(values)

    starTransition(async () => {
      const result = await Reset(values)

      if(result?.error){
        setErrorMessage(result.error)
        return
      }

      setSuccessMessage(result.success)
    })
  }

  return(
    <CardWrapper 
      headerLabel="Forgot your password?"
      backButtonLabel="Back to login"
      backButtonHref="/auth/login"
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
          </div>
          <FormError message={errorMessage} />
          <FormSuccess message={successMessage} />
          <Button
            disabled={isPending}
            type='submit'
            className='w-full'
          >
            Send reset email
          </Button>
        </form>
      </Form>
    </CardWrapper>
  )
}