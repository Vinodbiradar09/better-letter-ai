"use client"
import React, { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { LetterFeSchema } from "@/app/schemas/LetterSchema";
import { mentors } from "@/app/helpers/proffessors";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ApiRes } from "@/app/types/ApiRes";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { LetterT } from "@/app/types/ApiRes";

const LeaveLetter = () => {
    const router = useRouter();
    const [letter , setLetter] = useState<LetterT | null>(null);
    const [isGeneratingLetter, setIsGeneratingLetter] = useState<boolean>(false);
    const { data: session, status } = useSession();

    const form = useForm<z.infer<typeof LetterFeSchema>>({
        resolver: zodResolver(LetterFeSchema),
        defaultValues: {
            to: {
                name: "",
                email: "",
                info: ""
            },
            fromDate: "",
            toDate: "",
            totalDays: 1,
            reason: ""
        }
    });

    const watchFromDate = form.watch("fromDate");
    const watchToDate = form.watch("toDate");

    useEffect(() => {
        if (watchFromDate && watchToDate) {
            const from = new Date(watchFromDate);
            const to = new Date(watchToDate);
            const diffTime = to.getTime() - from.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            const totalDays = diffDays > 0 ? diffDays : 1;
            form.setValue("totalDays", totalDays);
        }
    }, [watchFromDate, watchToDate, form]);

    const handleMentorChange = useCallback((mentorId: string) => {
        const selectedMentor = mentors.find(m => m._id === mentorId);
        if (selectedMentor) {
            form.setValue("to.name", selectedMentor.name);
            form.setValue("to.email", selectedMentor.email);
            form.setValue("to.info", selectedMentor.info);
        }
    }, [form]);

    useEffect(() => {
        if (status === "loading") return;
        if (!session?.user) {
            router.replace("/sign-in");
            return;
        }
    }, [session, router, status]);

    const generateLetter = async (data: z.infer<typeof LetterFeSchema>) => {
        setIsGeneratingLetter(true);
        
        try {
            const response = await axios.post<ApiRes>("/api/betterletter", data);
            
            if (response.data.success) {
                toast("Letter generated successfully!", {
                    action : {
                        label : "Yeah",
                        onClick : ()=> console.log("ok"),
                    }
                });
                setLetter(response.data.letter || null)
                form.reset();
            } else {
                toast.error("Letter generation failed", {
                    description: response.data.message,
                    action : {
                        label : "Yeah",
                        onClick : ()=> console.log("ok"),
                    }
                });
            }

        } catch (error) {
            const axiosError = error as AxiosError<ApiRes>;
            const errorMessage = axiosError.response?.data.message || "Failed to generate letter";
            toast(errorMessage || "error generating the letter" , {
                description : "try again for regenerating the letter",
                action : {
                    label : "Yeah",
                    onClick : ()=> console.log("ok"),
                }
            })
        } finally {
            setIsGeneratingLetter(false);
        }
    };

    if (status === "loading") {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <p className="text-white text-xl font-semibold tracking-wide animate-pulse">
                    Loading...
                </p>
            </div>
        );
    }

    if (!session?.user) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center px-6">
                <div className="text-center max-w-md">
                    <h2 className="text-3xl font-bold text-white mb-4">
                        Authentication Required
                    </h2>
                    <p className="text-gray-400 text-lg tracking-wide">
                        Please login to continue
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto space-y-6 p-4">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(generateLetter)} className="space-y-6">
                    
                    <FormField
                        control={form.control}
                        name="to.name"
                        render={() => (
                            <FormItem>
                                <FormLabel>Select Mentor</FormLabel>
                                <FormControl>
                                    <Select onValueChange={handleMentorChange}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choose a mentor" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {mentors.map((mentor) => (
                                                <SelectItem key={mentor._id} value={mentor._id || ""}>
                                                    {mentor.name} - {mentor.info}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="fromDate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>From Date</FormLabel>
                                <FormControl>
                                    <Input 
                                        type="date" 
                                        {...field}
                                        min={new Date().toISOString().split('T')[0]}
                                        disabled={isGeneratingLetter}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="toDate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>To Date</FormLabel>
                                <FormControl>
                                    <Input 
                                        type="date" 
                                        {...field}
                                        min={watchFromDate || new Date().toISOString().split('T')[0]}
                                        disabled={isGeneratingLetter}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="totalDays"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Total Days</FormLabel>
                                <FormControl>
                                    <Input 
                                        type="number" 
                                        {...field}
                                        value={field.value}
                                        readOnly
                                        className="bg-gray-50"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="reason"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Reason for Leave</FormLabel>
                                <FormControl>
                                    <Textarea
                                        {...field}
                                        placeholder="Enter your reason for leave (minimum 5 words)"
                                        disabled={isGeneratingLetter}
                                        rows={4}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button 
                        type="submit" 
                        disabled={isGeneratingLetter || !form.formState.isValid}
                        className="w-full"
                    >
                        {isGeneratingLetter ? "Generating Letter..." : "Generate Leave Letter"}
                    </Button>
                </form>
            </Form>

            <div>
               {JSON.stringify(letter)}
            </div>
        </div>
    );
};

export default LeaveLetter;