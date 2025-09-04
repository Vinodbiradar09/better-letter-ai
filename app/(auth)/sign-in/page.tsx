"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
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
  hover: { scale: 1.05, boxShadow: "0 0 12px rgba(192,192,192,0.8)" },
  tap: { scale: 0.95 },
};

const SignInForm = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);

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
        toast("Invalid email or password", {
          description: "Please try again with the correct credentials.",
          action: {
            label: "Got it",
            onClick: () => console.log("Undo happend"),
          },
        });
      } else {
        toast(result.error || "Login failed");
      }
    }

    if (result?.url) {
      toast("successfully signed in", {
        description: "now you can generate the leave letters...",
        action: {
          label: "Yeah",
          onClick: () => console.log("ok"),
        },
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
      className="min-h-screen flex items-center justify-center p-8 bg-black"
    >
      <motion.div
        variants={containerVariants}
        transition={containerTransition}
        className="w-full max-w-md p-8 bg-[#0a0a0a] border border-slate-700 rounded-md shadow-xl backdrop-blur-sm"
        style={{ boxShadow: "inset 0 0 12px rgba(192,192,192,0.1)" }}
      >
        <motion.h2
          variants={fieldVariants}
          className="text-3xl font-semibold text-slate-300 mb-8 select-none"
          style={{
            fontFamily: "'Libre Baskerville', serif, Times New Roman, serif",
            letterSpacing: "0.08em",
          }}
        >
          Sign In
        </motion.h2>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>
            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <motion.div variants={fieldVariants}>
                  <FormItem>
                    <FormLabel className="text-slate-400 font-serif" style={{ letterSpacing: "0.06em" }}>
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Your Email"
                        {...field}
                        className="bg-transparent border border-slate-600 text-slate-300 placeholder-slate-500 focus:border-slate-400 focus:ring-0"
                      />
                    </FormControl>
                    <FormMessage className="text-pink-500" />
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
                    <FormLabel className="text-slate-400 font-serif" style={{ letterSpacing: "0.06em" }}>
                      Password
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Your Password"
                        {...field}
                        type="password"
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
                {isLoading ? "Signing in ..." : "Sign in"}
              </Button>
            </motion.div>
          </form>
        </Form>

        <motion.p
          variants={fieldVariants}
          className="mt-6 text-center text-slate-500 text-sm select-none"
          style={{ fontFamily: "'Georgia', serif" }}
        >
          Don’t have an account?{" "}
          <Link href="/sign-up" className="text-slate-400 underline hover:text-slate-200">
            Sign up here
          </Link>
        </motion.p>
      </motion.div>
    </motion.div>
  );
};

export default SignInForm;
