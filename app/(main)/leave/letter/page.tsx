"use client";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ApiRes } from "@/app/types/ApiRes";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { LetterT } from "@/app/types/ApiRes";
import Navbar from "@/components/Navbar";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { motion, Variants } from "framer-motion";

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const containerTransition = {
  staggerChildren: 0.1,
};

const fieldVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const buttonVariants: Variants = {
  rest: { scale: 1, boxShadow: "none" },
  hover: { scale: 1.05, boxShadow: "0 0 12px rgba(192,192,192,0.8)" },
  tap: { scale: 0.95 },
};

const LeaveLetter = () => {
  const router = useRouter();
  const [letter, setLetter] = useState<LetterT | null>(null);
  const [isGeneratingLetter, setIsGeneratingLetter] = useState<boolean>(false);
  const [isSendingEmail, setIsSendingEmail] = useState<boolean>(false);
  const { data: session, status } = useSession();

  const form = useForm<z.infer<typeof LetterFeSchema>>({
    resolver: zodResolver(LetterFeSchema),
    defaultValues: {
      to: {
        name: "",
        email: "",
        info: "",
      },
      fromDate: "",
      toDate: "",
      totalDays: 1,
      reason: "",
    },
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

  const handleMentorChange = useCallback(
    (mentorId: string) => {
      const selectedMentor = mentors.find((m) => m._id === mentorId);
      if (selectedMentor) {
        form.setValue("to.name", selectedMentor.name);
        form.setValue("to.email", selectedMentor.email);
        form.setValue("to.info", selectedMentor.info);
      }
    },
    [form]
  );

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
          action: {
            label: "Yeah",
            onClick: () => console.log("ok"),
          },
        });
        setLetter(response.data.letter || null);
      } else {
        toast.error("Letter generation failed", {
          description: response.data.message,
          action: {
            label: "Yeah",
            onClick: () => console.log("ok"),
          },
        });
        setLetter(null);
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiRes>;
      const errorMessage =
        axiosError.response?.data.message || "Failed to generate letter";
      toast(errorMessage || "error generating the letter", {
        description: "try again for regenerating the letter",
        action: {
          label: "Yeah",
          onClick: () => console.log("ok"),
        },
      });
      setLetter(null);
    } finally {
      setIsGeneratingLetter(false);
    }
  };

  const confirmAndSend = async (id: string) => {
    setIsSendingEmail(true);
    try {
      if (!id) {
        throw new Error("Id is required to send the leave letter");
      }
      const response = await axios.post<ApiRes>(`/api/sendletter/${id}`);
      if (response.data.success) {
        toast("Letter sent", {
          description: `Your Leave Letter has been sent to ${letter?.to.name}'s email`,
          action: {
            label: "Yeah",
            onClick: () => console.log("ok"),
          },
        });
        form.reset();
        setLetter(null);
        router.replace("/leave/letter");
      } else {
        toast("Failed to send the letter to your mentor's email", {
          action: {
            label: "Yeah",
            onClick: () => console.log("ok"),
          },
        });
      }
    } catch (error) {
      console.log("Error while sending the letter to your mentor", error);
      const axiosError = error as AxiosError<ApiRes>;
      toast(
        axiosError.response?.data.message || "Error while sending the letter to mentor",
        {
          action: {
            label: "Yeah",
            onClick: () => console.log("ok"),
          },
        }
      );
    } finally {
      setIsSendingEmail(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <p className="text-white text-xl font-semibold tracking-wide animate-pulse">
          Loading...
        </p>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <h2 className="text-3xl font-bold text-white mb-4">Authentication Required</h2>
          <p className="text-gray-400 text-lg tracking-wide">Please login to continue</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-300 flex flex-col">
      <Navbar />

      {/* Centered user info below navbar */}
      <div className="text-center border-b border-slate-700 py-6">
        <h2 className="text-xl font-semibold select-none">{session.user?.name}</h2>
        <p className="text-sm text-gray-400 select-text">{session.user?.usn ?? "USN not available"}</p>
      </div>

      {/* Main content: form left, letter right */}
      <div className="flex flex-col lg:flex-row max-w-7xl mx-auto p-6 flex-1 gap-8">
        {/* Left - Form */}
        <section className="lg:w-1/2 bg-[#121212] border border-slate-700 rounded-md p-6 shadow-lg overflow-auto max-h-[calc(100vh-12rem)]">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(generateLetter)} className="space-y-6" noValidate>
              <FormField
                control={form.control}
                name="to.name"
                render={() => (
                  <FormItem>
                    <FormLabel>Select Mentor</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={handleMentorChange}
                        disabled={isGeneratingLetter}
                        aria-label="Select a mentor"
                      >
                        <SelectTrigger className="bg-transparent border border-slate-600 placeholder-slate-500 text-slate-300 focus:border-slate-400 focus:ring-0">
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
                        min={new Date().toISOString().split("T")[0]}
                        disabled={isGeneratingLetter}
                        className="bg-transparent border border-slate-600 placeholder-slate-500 text-slate-300 focus:border-slate-400 focus:ring-0 appearance-none"
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
                        min={watchFromDate || new Date().toISOString().split("T")[0]}
                        disabled={isGeneratingLetter}
                        className="bg-transparent border border-slate-600 placeholder-slate-500 text-slate-300 focus:border-slate-400 focus:ring-0 appearance-none"
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
                        className="bg-gray-900 border border-slate-700 text-slate-300"
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
                        className="bg-transparent border border-slate-600 placeholder-slate-500 text-slate-300 focus:border-slate-400 focus:ring-0 resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={isGeneratingLetter || !form.formState.isValid}
                className="w-full mt-2"
              >
                {isGeneratingLetter ? "Generating Letter..." : "Generate Leave Letter"}
              </Button>
            </form>
          </Form>
        </section>

        {/* Right - Generated letter */}
        <section className="lg:w-1/2 bg-[#121212] border border-slate-700 rounded-md p-6 shadow-lg overflow-auto max-h-[calc(100vh-12rem)] flex flex-col justify-between">
          {letter ? (
            <>
              <Card className="bg-[#1b1b1b] border border-slate-700 p-4 mb-6 flex-grow overflow-auto">
                <CardHeader>
                  <h3 className="text-lg font-semibold text-slate-300">Generated Leave Letter</h3>
                </CardHeader>
                <CardContent className="text-slate-300 whitespace-pre-wrap">
                  <p>
                    <strong>From:</strong> {letter.from.name} ({letter.from.usn}) - {letter.from.email}
                  </p>
                  <p>
                    <strong>To:</strong> {letter.to.name} - {letter.to.email} ({letter.to.info})
                  </p>
                  <p>
                    <strong>Date:</strong> {letter.date}
                  </p>
                  <h4 className="font-semibold mt-4">{letter.subject}</h4>
                  <p className="mt-1">{letter.body}</p>
                </CardContent>
              </Card>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={form.handleSubmit(generateLetter)}
                  disabled={isGeneratingLetter}
                  className="flex-1"
                >
                  {!isGeneratingLetter ? "Regenerate" : "Regenerating..."}
                </Button>
                <Button
                  onClick={() => letter._id && confirmAndSend(letter._id.toString())}
                  disabled={isSendingEmail}
                  className="flex-1"
                >
                  {isSendingEmail ? "Sending..." : "Confirm & Send"}
                </Button>
              </div>
            </>
          ) : (
            <p className="text-center text-gray-500 select-none">No letter generated yet.</p>
          )}
        </section>
      </div>
    </div>
  );
};

export default LeaveLetter;
