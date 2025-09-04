"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
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
import Link from "next/link";
import { signinValidation } from "@/app/schemas/UserSchema";
import z from "zod";

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
  hover: {
    scale: 1.05,
    boxShadow: "0 0 20px 4px rgba(255 229 100 / 0.85)",
  },
  tap: { scale: 0.95 },
};

const sampleLines = [
  "Hey, sleeping in again?",
  "Your last push was yesterday?",
  "Forgot to add that semicolon 😉",
  "Code compiles but you’re late!",
  "Professor's glare is real 👀",
  "Lab sessions > Sleeping",
  "Keep calm and code on",
  "Commit early, commit often",
];

// Positions for sample lines (spread across viewport)
const letterPositions = [
  { y: "8%", x: "5%" },
  { y: "14%", x: "40%" },
  { y: "20%", x: "70%" },
  { y: "28%", x: "10%" },
  { y: "36%", x: "55%" },
  { y: "44%", x: "80%" },
  { y: "52%", x: "12%" },
  { y: "60%", x: "47%" },
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
      className="pointer-events-none select-none absolute max-w-[30vw] xs:max-w-[25vw] sm:max-w-[20vw] whitespace-normal break-words"
      style={{
        top: y,
        left: x,
        transform: `scale(${scale}) rotate(${rotate}deg)`,
        opacity,
      }}
    >
      <p
        className="text-slate-400 text-lg sm:text-xl md:text-2xl leading-relaxed tracking-wide drop-shadow-sm"
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
      className="pointer-events-none select-none absolute max-w-xs bg-yellow-400 text-black rounded-md px-5 py-3 shadow-lg z-10"
      style={{ top, left, rotate: "-8deg" }}
      initial={{ y: 0, rotate: -6 }}
      animate={{ y: [0, 5, 0], rotate: [-6, 3, -6] }}
      transition={{
        repeat: Infinity,
        duration: 6,
        ease: "easeInOut",
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}

const SignInForm = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof signinValidation>>({
    resolver: zodResolver(signinValidation),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof signinValidation>) => {
    setIsLoading(true);
    const result = await signIn("credentials", {
      redirect: false,
      email: data.email,
      password: data.password,
    });

    if (result?.error) {
      if (result.error === "Error:  Invalid Password") {
        toast("Invalid email or password.", {
          description: "Please try again.",
          action: {
            label: "Got it",
            onClick: () => {},
          },
        });
      } else {
        toast.error(result.error);
      }
    }

    if (result?.url) {
      toast("Successfully signed in! Welcome back." , {
        action : {
          label : "Yeah",
          onClick : ()=> console.log("ok"),
        }
      });
      router.replace("/leave/letter");
    }
    setIsLoading(false);
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      transition={containerTransition}
      className="relative min-h-screen flex items-center justify-center bg-black overflow-hidden p-8"
    >
      {/* Background sample letter lines */}
      {sampleLines.map((line, index) => (
        <StaticLine
          key={index}
          text={line}
          y={letterPositions[index]?.y || `${8 + index * 7}%`}
          x={letterPositions[index]?.x || "10%"}
          scale={0.8 + (index % 3) * 0.15}
          opacity={0.15 + (index % 4) * 0.08}
          rotate={((index % 5) * 6) - 10}
        />
      ))}

      {/* Floating sticky notes */}
      <FloatingNote top="16%" left="5%" delay={0}>
        Slept till 9:00 AM,<br />Code won’t write itself!
      </FloatingNote>
      <FloatingNote top="43%" left="14%" delay={2}>
        Missed the debug call,<br />Oops!
      </FloatingNote>
      <FloatingNote top="60%" left="6%" delay={3}>
        Commit without push?<br />Classic rookie error!
      </FloatingNote>
      <FloatingNote top="65%" left="77%" delay={4}>
        Late to class,<br /> but code compiles!
      </FloatingNote>
      <FloatingNote top="31%" left="72%" delay={5}>
        Professor’s glare incoming,<br />Brace yourself!
      </FloatingNote>

      <motion.div
        variants={containerVariants}
        className="relative z-20 w-full max-w-lg bg-[#121212] p-8 rounded-xl border border-slate-700 shadow-xl backdrop-blur-md"
        style={{ boxShadow: "inset 0 0 20px rgba(255 229 100 / 0.2)" }}
      >
        <motion.h2
          variants={fieldVariants}
          className="text-3xl font-bold tracking-wide text-yellow-400 mb-8 select-none"
          style={{ letterSpacing: "0.15em", textTransform: "uppercase" }}
        >
          Sign In
        </motion.h2>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
            className="space-y-6"
          >
            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <motion.div variants={fieldVariants}>
                  <FormItem>
                    <FormLabel className="text-slate-400 font-serif">Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Your Email"
                        type="email"
                        autoComplete="email"
                        className="bg-transparent border border-slate-600 placeholder-slate-500 text-yellow-200 rounded-md focus:ring-0 focus:border-yellow-400"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </motion.div>
              )}
            />
            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <motion.div variants={fieldVariants}>
                  <FormItem>
                    <FormLabel className="text-slate-400 flex items-center justify-between">
                      Password
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="text-yellow-400 text-sm underline underline-offset-2 focus:outline-none"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Your Password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        className="bg-transparent border border-slate-600 placeholder-slate-500 text-yellow-200 rounded-md focus:ring-0 focus:border-yellow-400"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </motion.div>
              )}
            />

            <motion.div
              variants={buttonVariants}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
              className="mt-6"
            >
              <Button
                type="submit"
                disabled={form.formState.isSubmitting || isLoading}
                className="w-full bg-yellow-500 hover:bg-yellow-400 text-black rounded-md shadow-md transition"
              >
                {form.formState.isSubmitting || isLoading ? "Signing In..." : "Sign In"}
              </Button>
            </motion.div>
          </form>
        </Form>

        <motion.p
          variants={fieldVariants}
          className="mt-8 text-center text-yellow-400 font-mono select-none"
        >
          Don’t have an account?{" "}
          <Link href="/signup" className="underline hover:text-yellow-300">
            Sign up here
          </Link>
        </motion.p>
      </motion.div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville&family=Fira+Code&display=swap');
      `}</style>
    </motion.div>
  );
};

export default SignInForm;
