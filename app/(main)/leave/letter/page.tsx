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
import { CardHeader, CardContent } from "@/components/ui/card";
import { motion, Variants } from "framer-motion";
import { CalendarIcon } from "lucide-react";

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 100, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.9, ease: "easeInOut", staggerChildren: 0.2 },
  },
};

const fieldVariants: Variants = {
  hidden: { opacity: 0, x: -70, rotate: -10 },
  visible: {
    opacity: 1,
    x: 0,
    rotate: 0,
    transition: { duration: 0.6, ease: "easeOut", type: "spring", stiffness: 100 },
  },
};

const buttonVariants: Variants = {
  rest: { scale: 1, boxShadow: "0 0 0 rgba(0, 0, 0, 0)", y: 0 },
  hover: {
    scale: 1.1,
    y: -5,
    boxShadow: "0 10px 20px rgba(255, 255, 255, 0.1)",
    transition: { duration: 0.3, ease: "easeOut" },
  },
  tap: { scale: 0.95, y: 2, transition: { duration: 0.2 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.85, rotate: 5 },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: { duration: 0.8, ease: "easeInOut", type: "spring", stiffness: 80 },
  },
};

const glowVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 0.3,
    scale: 1.2,
    transition: { duration: 1.5, repeat: Infinity, repeatType: "loop", ease: "easeInOut" },
  },
};

const letterVariants: Variants = {
  hidden: { opacity: 0, y: 50, rotateX: -15 },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: { duration: 0.7, ease: "easeOut" },
  },
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
      <div className="min-h-screen bg-gradient-to-tl from-black via-[#0a0a0a] to-[#1a1a1a] flex items-center justify-center p-4 relative overflow-hidden">
        <motion.div
          variants={glowVariants}
          className="absolute inset-0 bg-gradient-to-r from-purple-900/30 to-blue-900/30 blur-3xl"
        />
        <motion.p
          initial="hidden"
          animate="visible"
          variants={fieldVariants}
          className="text-white text-3xl font-extrabold tracking-wider animate-pulse drop-shadow-lg z-10"
        >
          Loading...
        </motion.p>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-gradient-to-tl from-black via-[#0a0a0a] to-[#1a1a1a] flex items-center justify-center p-6 relative overflow-hidden">
        <motion.div
          variants={glowVariants}
          className="absolute inset-0 bg-gradient-to-r from-red-900/20 to-purple-900/20 blur-3xl"
        />
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="text-center max-w-md bg-[#0c0c0c]/80 p-10 rounded-2xl border border-[#2a2a2a] shadow-2xl backdrop-blur-sm z-10"
        >
          <h2 className="text-4xl font-extrabold text-white mb-4 drop-shadow-md">Authentication Required</h2>
          <p className="text-gray-300 text-lg tracking-wide">Please login to continue</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-tl from-black via-[#0a0a0a] to-[#1a1a1a] text-gray-200 flex flex-col overflow-hidden">
      <Navbar />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="text-center border-b border-[#2a2a2a] py-6 bg-[#0c0c0c]/80 shadow-md backdrop-blur-sm transform -skew-y-2"
      >
        <h2 className="text-2xl font-extrabold text-white drop-shadow-md">{session.user?.name}</h2>
        <p className="text-sm text-gray-400 select-text">{session.user?.usn ?? "USN not available"}</p>
      </motion.div>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="flex flex-col lg:flex-row max-w-7xl mx-auto p-6 flex-1 gap-10 relative"
      >
        <motion.div
          variants={glowVariants}
          className="absolute top-0 left-0 w-80 h-80 bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-full blur-3xl"
        />
        <motion.div
          variants={glowVariants}
          className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-br from-green-900/20 to-cyan-900/20 rounded-full blur-3xl"
        />

        <motion.section
          variants={cardVariants}
          className="lg:w-1/2 bg-[#0c0c0c]/80 border border-[#2a2a2a] rounded-3xl p-8 shadow-2xl backdrop-blur-sm overflow-auto max-h-[calc(100vh-12rem)] transform lg:-rotate-2 relative z-10"
        >
          <Form {...form}>
            <form onSubmit={form.handleSubmit(generateLetter)} className="space-y-8" noValidate>
              <motion.div variants={fieldVariants}>
                <FormField
                  control={form.control}
                  name="to.name"
                  render={() => (
                    <FormItem>
                      <FormLabel className="text-gray-200 font-semibold text-lg">Select Mentor</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={handleMentorChange}
                          disabled={isGeneratingLetter}
                          aria-label="Select a mentor"
                        >
                          <SelectTrigger className="bg-[#101010]/90 border border-[#3a3a3a] placeholder-gray-500 text-gray-200 focus:border-[#606060] focus:ring-0 rounded-xl shadow-inner transition-all duration-300">
                            <SelectValue placeholder="Choose a mentor" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#101010] border-[#3a3a3a] text-gray-200 rounded-xl">
                            {mentors.map((mentor) => (
                              <SelectItem key={mentor._id} value={mentor._id || ""} className="hover:bg-[#202020] rounded-lg">
                                {mentor.name} - {mentor.info}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
              </motion.div>

              <motion.div variants={fieldVariants}>
                <FormField
                  control={form.control}
                  name="fromDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-200 font-semibold text-lg">From Date</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="date"
                            {...field}
                            min={new Date().toISOString().split("T")[0]}
                            disabled={isGeneratingLetter}
                            className="bg-[#101010]/90 border border-[#3a3a3a] placeholder-gray-500 text-gray-200 focus:border-[#606060] focus:ring-0 appearance-none rounded-xl shadow-inner pl-12 transition-all duration-300"
                          />
                          <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-6 h-6 text-white pointer-events-none" />
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
              </motion.div>

              <motion.div variants={fieldVariants}>
                <FormField
                  control={form.control}
                  name="toDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-200 font-semibold text-lg">To Date</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="date"
                            {...field}
                            min={watchFromDate || new Date().toISOString().split("T")[0]}
                            disabled={isGeneratingLetter}
                            className="bg-[#101010]/90 border border-[#3a3a3a] placeholder-gray-500 text-gray-200 focus:border-[#606060] focus:ring-0 appearance-none rounded-xl shadow-inner pl-12 transition-all duration-300"
                          />
                          <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-6 h-6 text-white pointer-events-none" />
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
              </motion.div>

              <motion.div variants={fieldVariants}>
                <FormField
                  control={form.control}
                  name="totalDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-200 font-semibold text-lg">Total Days</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          value={field.value}
                          readOnly
                          className="bg-[#101010]/90 border border-[#3a3a3a] text-gray-200 rounded-xl shadow-inner"
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
              </motion.div>

              <motion.div variants={fieldVariants}>
                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-200 font-semibold text-lg">Reason for Leave</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Enter your reason for leave (minimum 5 words)"
                          disabled={isGeneratingLetter}
                          rows={5}
                          className="bg-[#101010]/90 border border-[#3a3a3a] placeholder-gray-500 text-gray-200 focus:border-[#606060] focus:ring-0 resize-none rounded-xl shadow-inner transition-all duration-300"
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
              </motion.div>

              <motion.button
                type="submit"
                disabled={isGeneratingLetter || !form.formState.isValid}
                className="w-full mt-4 bg-gradient-to-r from-[#2a2a2a] to-[#4a4a4a] text-white hover:from-[#3a3a3a] hover:to-[#5a5a5a] rounded-xl shadow-lg py-3 font-semibold transition-all duration-300"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                {isGeneratingLetter ? "Generating Letter..." : "Generate Leave Letter"}
              </motion.button>
            </form>
          </Form>
        </motion.section>

        <motion.section
          variants={cardVariants}
          className="lg:w-1/2 bg-[#0c0c0c]/80 border border-[#2a2a2a] rounded-3xl p-8 shadow-2xl backdrop-blur-sm overflow-auto max-h-[calc(100vh-12rem)] flex flex-col justify-between transform lg:rotate-2 relative z-10"
        >
          {letter ? (
            <>
              <motion.div
                initial="hidden"
                animate="visible"
                variants={letterVariants}
                className="bg-[#101010]/90 border border-[#3a3a3a] p-6 mb-8 flex-grow overflow-auto rounded-2xl shadow-inner transform perspective-1000 rotateY-5"
              >
                <CardHeader>
                  <h3 className="text-2xl font-extrabold text-white drop-shadow-md">Generated Leave Letter</h3>
                </CardHeader>
                <CardContent className="text-gray-200 whitespace-pre-wrap space-y-5">
                  <p>
                    <strong className="text-gray-100 font-semibold">From:</strong> {letter.from.name} ({letter.from.usn}) - {letter.from.email}
                  </p>
                  <p>
                    <strong className="text-gray-100 font-semibold">To:</strong> {letter.to.name} - {letter.to.email} ({letter.to.info})
                  </p>
                  <p>
                    <strong className="text-gray-100 font-semibold">Date:</strong> {letter.date}
                  </p>
                  <h4 className="font-bold text-white mt-4 text-lg">{letter.subject}</h4>
                  <p className="mt-2 leading-relaxed text-gray-300">{letter.body}</p>
                </CardContent>
              </motion.div>

              <div className="flex flex-col sm:flex-row gap-4">
                <motion.button
                  onClick={form.handleSubmit(generateLetter)}
                  disabled={isGeneratingLetter}
                  className="flex-1 bg-gradient-to-r from-[#2a2a2a] to-[#4a4a4a] text-white hover:from-[#3a3a3a] hover:to-[#5a5a5a] rounded-xl shadow-lg py-3 font-semibold transition-all duration-300"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  {!isGeneratingLetter ? "Regenerate" : "Regenerating..."}
                </motion.button>
                <motion.button
                  onClick={() => letter._id && confirmAndSend(letter._id.toString())}
                  disabled={isSendingEmail}
                  className="flex-1 bg-gradient-to-r from-[#2a2a2a] to-[#4a4a4a] text-white hover:from-[#3a3a3a] hover:to-[#5a5a5a] rounded-xl shadow-lg py-3 font-semibold transition-all duration-300"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  {isSendingEmail ? "Sending..." : "Send as Pdf"}
                </motion.button>
              </div>
            </>
          ) : (
            <motion.p
              initial="hidden"
              animate="visible"
              variants={fieldVariants}
              className="text-center text-gray-400 select-none text-xl font-semibold"
            >
              No letter generated yet.
            </motion.p>
          )}
        </motion.section>
      </motion.div>
    </div>
  );
};

export default LeaveLetter;