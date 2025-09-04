"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion, Variants } from "framer-motion";
import { verifyCodeValidation } from "@/app/schemas/UserSchema";
import { ApiRes } from "@/app/types/ApiRes";

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

const sampleLines = [
  "Hey, slept late again?",
  "Forgot to push yesterday?",
  "Missing labs every time!",
  "Hello, coding over sleep!",
  "Your build is breaking.",
  "Professor waiting & waving.",
  "Commit before the deadline!",
  "Code happens, class misses too.",
];

const letterPositions = [
  { y: "5%", x: "5%" },
  { y: "12%", x: "40%" },
  { y: "18%", x: "75%" },
  { y: "26%", x: "10%" },
  { y: "32%", x: "52%" },
  { y: "40%", x: "82%" },
  { y: "48%", x: "12%" },
  { y: "55%", x: "58%" },
];

function StaticLine({
  text,
  y,
  x,
  scale,
  opacity,
  rotate,
}: {
  text: string;
  y: string;
  x: string;
  scale: number;
  opacity: number;
  rotate: number;
}) {
  return (
    <div
      className="absolute pointer-events-none select-none max-w-[28vw] xs:max-w-[24vw] sm:max-w-[20vw] whitespace-normal break-words"
      style={{
        top: y,
        left: x,
        transform: `scale(${scale}) rotate(${rotate}deg)`,
        opacity,
      }}
    >
      <p
        style={{ fontFamily: "'Dancing Script', cursive" }}
        className="text-slate-400 text-lg sm:text-xl md:text-2xl leading-relaxed tracking-wide drop-shadow-sm"
      >
        {text}
      </p>
    </div>
  );
}

function FloatingNote({
  top,
  left,
  delay,
  children,
}: {
  top: string;
  left: string;
  delay: number;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      className="absolute pointer-events-none select-none max-w-xs rounded-lg bg-yellow-400 px-5 py-3 text-black shadow-lg"
      style={{ top, left, rotate: "-8deg", zIndex: 10 }}
      initial={{ y: 0, rotate: -6 }}
      animate={{ y: [0, 5, 0], rotate: [-6, 3, -6] }}
      transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay }}
    >
      {children}
    </motion.div>
  );
}

const EmailVerification = ()=> {
  const router = useRouter();
  const params = useParams() as { usn: string };
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(verifyCodeValidation),
    defaultValues: { verifyCode: "" },
  });

  async function onSubmit(data: { verifyCode: string }) {
    setIsLoading(true);
    try {
      const res = await axios.post<ApiRes>("/api/verify-code", {
        usn: params.usn,
        verifyCode: data.verifyCode,
      });
      if (res.data.success) {
        toast(res.data.message, {
          description: "You are verified! Please login now.",
          action : {
            label : "Yeah",
            onClick : ()=> console.log("ok"),
          }
        });
        router.replace("/sign-in");
      } else {
        toast(res.data.message ?? "Verification failed. Try later.", {
          action : {
            label : "Yeah",
            onClick : ()=> console.log("ok"),
          }
        });
      }
    } catch (error) {
      const e = error as AxiosError<ApiRes>;
      toast(e.response?.data.message ?? "Server error. Please try later.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <motion.div
      className="relative min-h-screen flex items-center justify-center bg-black overflow-hidden px-6 py-12"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      transition={containerTransition}
    >
      {sampleLines.map((line, idx) => (
        <StaticLine
          key={line}
          text={line}
          y={letterPositions[idx]?.y ?? `${5 + idx * 7}%`}
          x={letterPositions[idx]?.x ?? "10%"}
          scale={0.8 + (idx % 3) * 0.15}
          opacity={0.15 + (idx % 4) * 0.05}
          rotate={(idx % 5) * 6 - 10}
        />
      ))}

      <FloatingNote top="15%" left="5%" delay={0}>
        Slept late, bro? <br /> Wake up for CS!
      </FloatingNote>
      <FloatingNote top="40%" left="12%" delay={2}>
        Missed lab again! <br /> Oops hehe!
      </FloatingNote>
      <FloatingNote top="60%" left="6%" delay={3}>
        Forgot your push? <br /> Try again!
      </FloatingNote>
      <FloatingNote top="65%" left="78%" delay={4}>
        Late to class, <br /> but code’s green!
      </FloatingNote>
      <FloatingNote top="30%" left="72%" delay={5}>
        Get ready for the prof’s glare!
      </FloatingNote>

      <motion.div
        className="relative block max-w-md w-full rounded-xl bg-[#121212] p-8 border border-slate-700 shadow-xl backdrop-blur-md"
        variants={containerVariants}
      >
        <motion.h2
          className="text-3xl font-semibold text-yellow-400 mb-8"
          variants={fieldVariants}
          style={{
            letterSpacing: "0.15em",
            fontFamily: "'Libre Baskerville', serif",
            userSelect: "none",
          }}
        >
          Email Verification
        </motion.h2>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>
            <FormField
              name="verifyCode"
              control={form.control}
              render={({ field }) => (
                <motion.div variants={fieldVariants}>
                  <FormItem>
                    <FormLabel className="text-slate-400">Verification Code</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter your verification code"
                        className="bg-transparent border border-slate-600 placeholder-slate-500 text-yellow-200 rounded-md focus:ring-0 focus:border-yellow-400"
                        autoComplete="one-time-code"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </motion.div>
              )}
            />

            <motion.div
              className="mt-6"
              variants={buttonVariants}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
            >
              <Button
                type="submit"
                disabled={form.formState.isSubmitting || isLoading}
                className="w-full bg-yellow-500 text-black rounded-md transition hover:bg-yellow-400 shadow-md"
              >
                {form.formState.isSubmitting || isLoading ? "Verifying..." : "Verify"}
              </Button>
            </motion.div>
          </form>
        </Form>

        <motion.p
          className="mt-8 text-center text-yellow-400 font-mono cursor-default select-none"
          variants={fieldVariants}
        >
          Need a new code? sign-up again{" "} 
        </motion.p>
      </motion.div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville&family=Fira+Code&display=swap');
      `}</style>
    </motion.div>
  );
};

export default EmailVerification;
