"use client";
import React, { useState , useEffect} from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { signupValidation } from '@/app/schemas/UserSchema';
import axios,{AxiosError} from "axios";
import Link from 'next/link';
import { motion } from "framer-motion";
import { useRouter } from 'next/navigation';
import { useDebounceCallback } from "usehooks-ts";
import { ApiRes } from '@/app/types/ApiRes';
import { toast } from 'sonner';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const SignUpForm = () => {
    const router = useRouter();
    const [usn , setUsn] = useState<string>("");
    const [usnMessage , setUsnMessage] = useState<string>("");
    const [usnChecking , setIsUsnChecking] = useState<boolean>(false);
    const [formSubmitting , setIsFormSubmitting] = useState<boolean>(false);
    const [formError , setIsFormError] = useState<string>("");
    const [showPassword , setIsShowPassword] = useState<boolean>(false);
    const debounced = useDebounceCallback(setUsn , 500);

    const form = useForm<z.infer<typeof signupValidation>>({
        resolver : zodResolver(signupValidation),
        defaultValues : {
            name : "",
            email : "",
            usn : "",
            department : "",
            password : "",
        }
    })

    useEffect(() => {
        const checkUsnUnique = async()=>{
            if(usn){
                setIsUsnChecking(true);
                setUsnMessage("");
            }
            try {
                const response = await axios.get<ApiRes>(`/api/usn-unique?usn=${usn}`);
                if(response.data.success){
                    setUsnMessage(response.data.message);
                }else {
                    setUsnMessage(response.data.message)
                }
            } catch (error) {
                console.error("Error checking the usn in fe" , error);
                const axiosError = error as AxiosError<ApiRes>
                setUsnMessage(axiosError.response?.data.message ?? "Error while checking the usn");
            } finally{
                setIsUsnChecking(false);
            }
        }
        checkUsnUnique();
    }, [usn])

    const onSubmit = async(data : z.infer<typeof signupValidation>)=>{
        setIsFormSubmitting(true);
        setIsFormError("");
        try {
            const response = await axios.post<ApiRes>("/api/sign-up" , data);
            if(response.data.success){
                toast("Yah!! 😊, your account created", {
                    description : "Please verify your account by email",
                    action : {
                        label : "Yeah",
                        onClick : ()=>console.log("ok"),
                    }
                })
                router.push(`/verify/${data.usn}`);
            }
            else{
                toast("Error while creating your account" , {
                    description : "Please try again",
                    action : {
                        label : "Yeah",
                        onClick : ()=> console.log("ok")
                    }
                })
            }
        } catch (error) {
            console.error("Error while creating the user account" , error);
            const axiosError = error as AxiosError<ApiRes>
            toast(axiosError.response?.data.message || "Error while creating the account" , {
                description : "Due internal server error Account creation is failed",
                action : {
                    label : "Yeah",
                    onClick : ()=> console.log("ok"),
                }
            })
        }
    }
    


  return (
    <div>
     <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
            <FormField 
            name='name'
            control={form.control}
            render={({field})=> (
                <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                        <Input placeholder='Choose Your Beautiful Name' {...field}/>
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            name='email'
            control={form.control}
            render={({field})=>(
                <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                        <Input placeholder='Your Email' {...field}/>
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            name='usn'
            control={form.control}
            render={({field})=>(
                <FormItem>
                    <FormLabel>Usn</FormLabel>
                    <FormControl>
                        <Input placeholder='Your Usn' {...field} onChange={(e)=>{field.onChange(e); debounced(e.target.value)}}/>
                    </FormControl>
                    <div>
                    {!usnChecking ? (
                        <p> {usnMessage}</p>
                    ): <p> wait a sec</p>}
                    </div>
                    <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            name='department'
            control={form.control}
            render={({field})=>(
                <FormItem>
                    <FormLabel>Department</FormLabel>
                    <FormControl>
                        <Input placeholder='Your Department' {...field}/>
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            name='password'
            control={form.control}
            render={({field})=>(
                <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                        <Input placeholder='Your Password' {...field}/>
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
            />

            <Button type='submit'>{formSubmitting ? "submitting" : "submit"}</Button>
        </form>
     </Form>
    </div>
  )
}

export default SignUpForm
