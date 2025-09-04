"use client";

import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { signupValidation } from "@/app/schemas/UserSchema";
import axios, { AxiosError } from "axios";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { useRouter } from "next/navigation";
import { useDebounceCallback } from "usehooks-ts";
import { ApiRes } from "@/app/types/ApiRes";
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

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const containerTransitions = {
  staggerChildren: 0.1,
};

const fieldVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const buttonVariants: Variants = {
  rest: { scale: 1, boxShadow: "none" },
  hover: {
    scale: 1.05,
    boxShadow: "0 0 20px 4px rgba(255 229 100 / 0.85)",
  },
  tap: { scale: 0.95 },
};

const sampleLines = [
  "Dear Professor,",
  "I hope this finds you well.",
  "Unfortunately, I couldn't attend lecture today because",
  "I was feeling under the weather.",
  "I apologize for the inconvenience.",
  "Thank you for your understanding.",
  "Sincerely,",
  "A Dedicated Student",
];

const letterPositions = [
  { y: "9%", x: "3vw" },
  { y: "15%", x: "35vw" },
  { y: "20%", x: "68vw" },
  { y: "28%", x: "6vw" },
  { y: "34%", x: "42vw" },
  { y: "40%", x: "75vw" },
  { y: "50%", x: "5vw" },
  { y: "58%", x: "45vw" },
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
      className="pointer-events-none absolute whitespace-normal break-words max-w-[30vw] sm:max-w-[25vw] md:max-w-[20vw] select-none"
      style={{
        top: y,
        left: x,
        transform: `scale(${scale}) rotate(${rotate}deg)`,
        opacity,
        userSelect: "none",
      }}
    >
      <p
        className="text-slate-400 text-base sm:text-lg md:text-xl leading-relaxed tracking-wide drop-shadow-sm"
        style={{ fontFamily: "'Dancing Script', cursive" }}
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
      className="pointer-events-none select-none absolute max-w-[15rem] bg-yellow-400 rounded-lg px-5 py-3 shadow-lg text-black"
      style={{ top, left, transform: "rotate(-8deg)", zIndex: 10 }}
      initial={{ y: 0, rotate: -6 }}
      animate={{ y: [0, 6, 0], rotate: [-6, 3, -6] }}
      transition={{
        repeat: Infinity,
        duration: 5,
        ease: "easeInOut",
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}

const SignUp = () => {
  const router = useRouter();
  const [usn, setUsn] = useState("");
  const [usnMessage, setUsnMessage] = useState("");
  const [usnChecking, setUsnChecking] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const debounced = useDebounceCallback(setUsn, 500);

  const form = useForm<z.infer<typeof signupValidation>>({
    resolver: zodResolver(signupValidation),
    defaultValues: {
      name: "",
      email: "",
      usn: "",
      department: "",
      password: "",
    },
  });

  useEffect(() => {
    if (!usn) {
      setUsnMessage("");
      return;
    }

    const checkUnique = async () => {
      setUsnChecking(true);
      try {
        const res = await axios.get<ApiRes>(`/api/usn-unique?usn=${usn}`);
        setUsnMessage(res.data.message);
      } catch (error) {
        const e = error as AxiosError<ApiRes>;
        setUsnMessage(e.response?.data.message ?? "Error checking USN");
      } finally {
        setUsnChecking(false);
      }
    };

    checkUnique();
  }, [usn]);

  const onSubmit = async (data: z.infer<typeof signupValidation>) => {
    setFormSubmitting(true);
    try {
      const res = await axios.post<ApiRes>("/api/sign-up", data);
      if (res.data.success) {
        toast("Account created! Please verify via email." , {
          action : {
            label : "Yeah",
            onClick : ()=> console.log("ok"),
          }
        });
        router.push(`/verify/${data.usn}`);
      } else {
        toast("Failed to create account. Try again." , {
          action : {
            label : "Yeah",
            onClick : ()=> console.log("ok")
          }
        });
      }
    } catch (error) {
      const e = error as AxiosError<ApiRes>;
      toast.error(e.response?.data.message ?? "Server error. Try later.");
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      transition={containerTransitions}
      className="min-h-screen flex justify-center items-center px-4 py-12 bg-black relative overflow-hidden"
    >
  
      {sampleLines.map((line, idx) => (
        <StaticLine
          key={line}
          text={line}
          y={letterPositions[idx]?.y ?? `${10 + idx * 9}%`}
          x={letterPositions[idx]?.x ?? "5vw"}
          scale={0.8 + (idx % 3) * 0.15}
          opacity={0.15 + (idx % 4) * 0.1}
          rotate={(idx % 5) * 3 - 10}
        />
      ))}

     
      <FloatingNote top="18%" left="5%" delay={0}>
       Ass man you again slept till 10:00 am 
      </FloatingNote>
      <FloatingNote top="45%" left="10%" delay={2}>
        If you ran fast probably you might enter the class
      </FloatingNote>
      <FloatingNote top="62%" left="7%" delay={3}>
        That&apos;s cool we will generate the letter
      </FloatingNote>
      <FloatingNote top="58%" left="75%" delay={4}>
        WTF, again late to lab? 🤬
      </FloatingNote>
      <FloatingNote top="30%" left="70%" delay={5}>
        AI-generated excuses FTW! 🤖
      </FloatingNote>

    
      <motion.div
        variants={containerVariants}
        transition={containerTransitions}
        className="w-full max-w-lg bg-[#121212] rounded-xl border border-slate-700 shadow-xl backdrop-blur-md p-8 relative z-20"
        style={{ boxShadow: "inset 0 0 20px rgba(255 229 100 / 0.2)" }}
      >
        <motion.h1
          variants={fieldVariants}
          className="text-3xl font-serif tracking-widest text-yellow-400 mb-10 select-none"
          style={{
            letterSpacing: "0.15em",
            fontVariantCaps: "small-caps",
            textTransform: "uppercase",
          }}
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          Register Your Account
        </motion.h1>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-6">
            {([
              { name: "name", placeholder: "Your full name", type: "text" },
              { name: "email", placeholder: "Your email", type: "email" },
              { name: "usn", placeholder: "University Seat Number", type: "text" },
              { name: "department", placeholder: "Department", type: "text" },
              { name: "password", placeholder: "Password", type: showPassword ? "text" : "password" },
            ]as const).map(({ name, placeholder, type }) => (
              <FormField
                key={name}
                name={name}
                control={form.control}
                render={({ field }) => (
                  <motion.div variants={fieldVariants}>
                    <FormItem>
                      <FormLabel className="text-yellow-300 font-serif mb-1">
                        {name === "usn" ? "USN" : name.charAt(0).toUpperCase() + name.slice(1)}
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            placeholder={placeholder}
                            type={type}
                            className="bg-transparent border border-yellow-600 placeholder-yellow-600 text-yellow-200 rounded-md focus:ring-0 focus:border-yellow-400 pr-12"
                            onChange={(e) => {
                              field.onChange(e);
                              if (name === "usn") debounced(e.target.value);
                              if (name === "password") setShowPassword(false);
                            }}
                          />
                          {name === "password" && (
                            <button
                              type="button"
                              onClick={() => setShowPassword((v) => !v)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-yellow-400 hover:text-yellow-300 focus:outline-none"
                              aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                              {showPassword ? "🙈" : "👁️"}
                            </button>
                          )}
                        </div>
                      </FormControl>
                      {name === "usn" && (
                        <p className="mt-1 text-sm text-yellow-500 min-h-[1rem] select-none">
                          {usnChecking ? "Checking..." : usnMessage}
                        </p>
                      )}
                      <FormMessage className="text-pink-400" />
                    </FormItem>
                  </motion.div>
                )}
              />
            ))}

            <motion.div
              variants={buttonVariants}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
              className="mt-6"
            >
              <Button
                type="submit"
                disabled={formSubmitting}
                className="w-full bg-yellow-500 hover:bg-yellow-400 text-black rounded-md transition-shadow shadow-md"
              >
                {formSubmitting ? "Creating Account…" : "Create Account"}
              </Button>
            </motion.div>
          </form>
        </Form>

        <motion.p
          variants={fieldVariants}
          className="mt-8 text-center text-yellow-400 font-mono select-none"
        >
          Already have an account?{" "}
          <Link href="/sign-in" className="underline hover:text-yellow-300">
            Log in here
          </Link>
        </motion.p>
      </motion.div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville&family=Fira+Code&display=swap');
      `}</style>
    </motion.div>
  );
};

export default SignUp;
