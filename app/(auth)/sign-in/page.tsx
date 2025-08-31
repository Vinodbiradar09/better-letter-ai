"use client"
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import z from 'zod'
import { signIn } from 'next-auth/react'
import { toast } from 'sonner'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { motion } from "framer-motion"
import Link from "next/link"
import { signinValidation } from '@/app/schemas/UserSchema';


const SignInForm = () => {
    const router = useRouter();
    const [isLoading , setIsLoading] = useState<boolean>(false);
    const [showPassword , setShowPassword] = useState<boolean>(false);

    const form = useForm<z.infer<typeof signinValidation>>({
        resolver : zodResolver(signinValidation),
        defaultValues : {
            email : "",
            password : "",
        }
    })

    const onSubmit = async(data : z.infer<typeof signinValidation>)=>{
        setIsLoading(true)
        const result = await signIn("credentials", {
            redirect : false,
            email : data.email,
            password : data.password,
        })

         if(result?.error){
            if(result.error === "Error:  Invalid Password"){
                toast("Invalid email or password", {
                    description: "Please try again with the correct credentials.",
                    action : {
                        label : "Got it",
                        onClick : ()=> console.log("Undo happend"),
                    }
                })
            } else {
                toast(result.error || "Login failed")
            }
        }

        if(result?.url){
             toast("successfully signed in", {
                description : "now you can generate the leave letters...",
                action : {
                    label : "Yeah",
                    onClick : ()=> console.log("ok"),
                }
            })
            router.replace("/cool");
        }
        setIsLoading(false)
    }
  return (
    <div>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Your Email" {...field} />
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
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input placeholder="Your Password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">
            {
                isLoading ? (
                    "Signing in ..."
                ) : (
                    "Sign in"
                )
            }
        </Button>
      </form>
    </Form>
    </div>
  )
}

export default SignInForm
