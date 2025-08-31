"use client";
import React, { useState } from 'react'
import axios , {AxiosError} from "axios";
import { verifyCodeValidation } from '@/app/schemas/UserSchema';
import { useParams , useRouter } from 'next/navigation';
import { ApiRes } from '@/app/types/ApiRes';
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { motion } from "framer-motion"
import { z } from 'zod';

const EmailVerification = () => {
  const router = useRouter();
  const params = useParams<{usn : string}>();
  const [isLoading , setIsLoading] = useState<boolean>(false);

  const form = useForm<z.infer<typeof verifyCodeValidation>>({
    resolver : zodResolver(verifyCodeValidation),
    defaultValues : {
      verifyCode : "",
    }
  })

  const onSubmit = async (data : z.infer<typeof verifyCodeValidation>)=>{
      setIsLoading(true);
      try {
        const response = await axios.post<ApiRes>('/api/verify-code', {
          usn : params.usn,
          verifyCode : data.verifyCode,
        })
        if(response.data.success){
          toast(response.data.message , {
            description : "you are verified now please login",
            action : {
              label : "Yeah",
              onClick : ()=> console.log("ok"),
            }
          })
        } else {
          toast(response.data.message , {
            description : "oops error while verifying your account, please try after sometime",
            action : {
              label : "Yeah",
              onClick : ()=> console.log("ok"),
            }
          })
        }
        router.replace("/sign-in");
      } catch (error) {
        console.error("Error while verifying the account" , error);
        const axiosError = error as AxiosError<ApiRes>;
        toast(axiosError.response?.data.message , {
          description : "oops error while verifying your account, please try after sometime",
          action : {
            label : "Yeah",
            onClick : ()=> console.log("ok"),
          }
        })
      } finally {
        setIsLoading(false)
      }
  }
  return (
    <div>
         <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="verifyCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Verification Code</FormLabel>
              <FormControl>
                <Input placeholder="code" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">
          {
            isLoading ? (
              "Verifying..."
            ) : (
              "Verify"
            )
          }
        </Button>
      </form>
    </Form>
    </div>
  )
}

export default EmailVerification
