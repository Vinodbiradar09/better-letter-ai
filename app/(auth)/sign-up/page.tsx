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
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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

const SignUpForm = () => {
  const router = useRouter();
  const [usn, setUsn] = useState<string>("");
  const [usnMessage, setUsnMessage] = useState<string>("");
  const [usnChecking, setIsUsnChecking] = useState<boolean>(false);
  const [formSubmitting, setIsFormSubmitting] = useState<boolean>(false);
  const [showPassword, setIsShowPassword] = useState<boolean>(false);
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
    const checkUsnUnique = async () => {
      if (usn) {
        setIsUsnChecking(true);
        setUsnMessage("");
      }
      try {
        const response = await axios.get<ApiRes>(`/api/usn-unique?usn=${usn}`);
        setUsnMessage(response.data.message);
      } catch (error) {
        console.error("Error checking the usn in fe", error);
        const axiosError = error as AxiosError<ApiRes>;
        setUsnMessage(
          axiosError.response?.data.message ?? "Error while checking the usn"
        );
      } finally {
        setIsUsnChecking(false);
      }
    };
    checkUsnUnique();
  }, [usn]);

  const onSubmit = async (data: z.infer<typeof signupValidation>) => {
    setIsFormSubmitting(true);
    try {
      const response = await axios.post<ApiRes>("/api/sign-up", data);
      if (response.data.success) {
        toast("Yah!! 😊, your account created", {
          description: "Please verify your account by email",
          action: {
            label: "Yeah",
            onClick: () => console.log("ok"),
          },
        });
        router.push(`/verify/${data.usn}`);
      } else {
        toast("Error while creating your account", {
          description: "Please try again",
          action: {
            label: "Yeah",
            onClick: () => console.log("ok"),
          },
        });
      }
    } catch (error) {
      console.error("Error while creating the user account", error);
      const axiosError = error as AxiosError<ApiRes>;
      toast(
        axiosError.response?.data.message || "Error while creating the account",
        {
          description: "Due internal server error Account creation is failed",
          action: { label: "Yeah", onClick: () => console.log("ok") },
        }
      );
    } finally {
      setIsFormSubmitting(false);
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      transition={containerTransition}
      className="min-h-screen flex items-center justify-center px-6 py-12 bg-black"
    >
      <motion.div
        variants={containerVariants}
        transition={containerTransition}
        className="w-full max-w-lg p-7 bg-[#0a0a0a] border border-slate-700 rounded-md shadow-xl backdrop-blur-sm"
        style={{ boxShadow: "inset 0 0 12px rgba(192,192,192,0.1)" }}
      >
        <motion.h1
          variants={fieldVariants}
          className="text-3xl font-semibold text-slate-300 tracking-wide mb-8 select-none"
          style={{
            fontFamily:
              "'Libre Baskerville', serif, Times New Roman, serif",
            letterSpacing: "0.08em",
          }}
        >
          Register Your Account
        </motion.h1>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
            {([
              { name: "name", placeholder: "Your full name" },
              { name: "email", placeholder: "Email address" },
              { name: "usn", placeholder: "University Seat Number" },
              { name: "department", placeholder: "Department" },
              { name: "password", placeholder: "Password" },
            ]as const).map(({ name, placeholder }) => (
              <FormField
                key={name}
                name={name}
                control={form.control}
                render={({ field }) => (
                  <motion.div variants={fieldVariants}>
                    <FormItem>
                      <FormLabel
                        className="text-slate-400 font-serif"
                        style={{ letterSpacing: "0.06em" }}
                      >
                        {name === "usn" ? "USN" : name.charAt(0).toUpperCase() + name.slice(1)}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={placeholder}
                          {...field}
                          className="bg-transparent border border-slate-600 text-slate-300 placeholder-slate-500 focus:border-slate-400 focus:ring-0"
                          {...(name === "usn"
                            ? {
                                onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                                  field.onChange(e);
                                  debounced(e.target.value);
                                },
                              }
                            : {})}
                          type={name === "password" && !showPassword ? "password" : "text"}
                        />
                      </FormControl>
                      {name === "usn" && (
                        <p className="mt-1 min-h-[1.25rem] text-sm text-slate-500 select-none">
                          {!usnChecking ? usnMessage : "Checking..."}
                        </p>
                      )}
                      <FormMessage className="text-pink-500" />
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
              className="w-full"
            >
              <Button
                type="submit"
                disabled={formSubmitting}
                className="w-full bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold shadow-sm"
                style={{ boxShadow: "0 0 12px rgba(192,192,192,0.4)" }}
              >
                {formSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </motion.div>
          </form>
        </Form>

        <motion.p
          variants={fieldVariants}
          className="mt-6 text-center text-slate-500 text-sm select-none"
          style={{ fontFamily: "'Georgia', serif" }}
        >
          Already registered?{" "}
          <Link href="/login" className="text-slate-400 underline hover:text-slate-200">
            Log in here
          </Link>
        </motion.p>
      </motion.div>
    </motion.div>
  );
};

export default SignUpForm;
