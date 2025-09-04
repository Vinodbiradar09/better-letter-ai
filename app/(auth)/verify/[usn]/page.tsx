"use client";
import React, { useState } from "react";
import axios, { AxiosError } from "axios";
import { verifyCodeValidation } from "@/app/schemas/UserSchema";
import { useParams, useRouter } from "next/navigation";
import { ApiRes } from "@/app/types/ApiRes";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion, Variants } from "framer-motion";
import { z } from "zod";

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
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

const EmailVerification = () => {
  const router = useRouter();
  const params = useParams<{ usn: string }>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const form = useForm<z.infer<typeof verifyCodeValidation>>({
    resolver: zodResolver(verifyCodeValidation),
    defaultValues: {
      verifyCode: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof verifyCodeValidation>) => {
    setIsLoading(true);
    try {
      const response = await axios.post<ApiRes>("/api/verify-code", {
        usn: params.usn,
        verifyCode: data.verifyCode,
      });
      if (response.data.success) {
        toast(response.data.message, {
          description: "you are verified now please login",
          action: {
            label: "Yeah",
            onClick: () => console.log("ok"),
          },
        });
      } else {
        toast(response.data.message, {
          description: "oops error while verifying your account, please try after sometime",
          action: {
            label: "Yeah",
            onClick: () => console.log("ok"),
          },
        });
      }
      router.replace("/sign-in");
    } catch (error) {
      console.error("Error while verifying the account", error);
      const axiosError = error as AxiosError<ApiRes>;
      toast(axiosError.response?.data.message, {
        description: "oops error while verifying your account, please try after sometime",
        action: {
          label: "Yeah",
          onClick: () => console.log("ok"),
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      transition={containerTransition}
      className="min-h-screen flex items-center justify-center p-8 bg-black"
    >
      <motion.div
        variants={containerVariants}
        transition={containerTransition}
        className="w-full max-w-md p-7 bg-[#0a0a0a] border border-slate-700 rounded-md shadow-xl backdrop-blur-sm"
        style={{ boxShadow: "inset 0 0 12px rgba(192,192,192,0.1)" }}
      >
        <motion.h1
          variants={fieldVariants}
          className="text-3xl font-semibold text-slate-300 mb-8 select-none"
          style={{
            fontFamily: "'Libre Baskerville', serif, Times New Roman, serif",
            letterSpacing: "0.08em",
          }}
        >
          Email Verification
        </motion.h1>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>
            <FormField
              name="verifyCode"
              control={form.control}
              render={({ field }) => (
                <motion.div variants={fieldVariants}>
                  <FormItem>
                    <FormLabel className="text-slate-400 font-serif" style={{ letterSpacing: "0.06em" }}>
                      Verification Code
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="code"
                        {...field}
                        className="bg-transparent border border-slate-600 text-slate-300 placeholder-slate-500 focus:border-slate-400 focus:ring-0"
                      />
                    </FormControl>
                    <FormMessage className="text-pink-500" />
                  </FormItem>
                </motion.div>
              )}
            />

            <motion.div
              variants={buttonVariants}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
              className="w-full"
            >
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold shadow-sm"
                style={{ boxShadow: "0 0 12px rgba(192,192,192,0.4)" }}
              >
                {isLoading ? "Verifying..." : "Verify"}
              </Button>
            </motion.div>
          </form>
        </Form>
      </motion.div>
    </motion.div>
  );
};

export default EmailVerification;
