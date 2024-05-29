'use client'

import { CardWrapper } from "./card.wrapper";
import { BeatLoader } from 'react-spinners'
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { NewVerification } from "@/app/_actions/new.verification";
import { FormError } from "../form.error";
import { FormSuccess } from "../form.success";

export default function NewVerificationForm(){
  const [error, setError] = useState<string | undefined>()
  const [success, setSuccess] = useState<string | undefined>()

  const searchParams = useSearchParams()

  const token = searchParams.get('token')

  const onSubmit = useCallback(async () => {
    if(success || error) return 

    if(!token){
      setError('Missing token')
      return
    }

    const result = await NewVerification(token)

    if(result.error){
      setError(result.error)
      return
    }

    setSuccess(result.success)
  }, [token, success, error])

  useEffect(() => {
    onSubmit()
  }, [onSubmit])

  return(
    <CardWrapper
      headerLabel="Confirming your verification"
      backButtonLabel="Back to login"
      backButtonHref="/auth/login"
    >
      <div className="flex flex-col items-center w-full justify-center space-y-3">
        {!success && !error && (
          <BeatLoader />
        )}
        {!success && (
          <FormError message={error} />
        )}
        <FormSuccess message={success} />
      </div>
    </CardWrapper>
  )
}