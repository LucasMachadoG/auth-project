'use client'

import { Settings } from "@/app/_actions/settings"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { useState, useTransition } from "react"
import { useSession } from "next-auth/react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { settingsSchema } from "@/schemas"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useCurrentUser } from "@/hooks/use.current.user"
import { FormError } from "@/components/form.error"
import { FormSuccess } from "@/components/form.success"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserRole } from "@prisma/client"
import { Switch } from "@/components/ui/switch"

export default function SettingsPage(){
  const user = useCurrentUser()
  const [error, setError] = useState<string | undefined>()
  const [success, setSuccess] = useState<string | undefined>()
  const [isPending, startTransition] = useTransition()
  const { update } = useSession()

  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: user?.name || undefined,
      email: user?.email || undefined,
      password: undefined,
      newPassword: undefined,
      role: user?.role || undefined,
      isTwoFactorEnable: user?.isTwoFactorEnable || undefined
    }
  })

  const onSubmit = (values: z.infer<typeof settingsSchema>) => {
    setError("")
    setSuccess("")

    startTransition( async () => {
      const result = await Settings(values)

      if(result.error){
        setError(result.error)
        return
      }

      update()
      setSuccess(result.success)
    })
  }

  return(
    <Card className="w-[600px]">
      <CardHeader>
        <p className="text-2xl font-semibold text-center">⚙️ Settings</p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-6">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="John Doe" disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              {user?.isOAuth === false && (
                <>
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="johndoe@example.com" type="email" disabled={isPending} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="password" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="******" type="password" disabled={isPending} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="newPassword" render={({ field }) => (
                    <FormItem>
                      <FormLabel>New password</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="******" type="password" disabled={isPending} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="isTwoFactorEnable" render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Two Factor Authentication</FormLabel>
                        <FormDescription>
                          Enable two factor authentication for your account.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch 
                          disabled={isPending}
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
              )} />
                </>
              )}
              <FormField control={form.control} name="role" render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select disabled={isPending} onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={UserRole.ADMIN}>
                        Admin
                      </SelectItem>
                      <SelectItem value={UserRole.USER}>
                        User
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              
              <FormError message={error} />
              <FormSuccess message={success} />
            </div>
            <Button disabled={isPending} type="submit">Save</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}