import { z } from "zod";

export const usnValidation = z.string()
  .length(10, "USN must be 10 characters only")
  .regex(
    /^1AY(22|23|24|25|26)[A-Z]{2,3}((00[1-9]|0[1-9][0-9]|1[0-7][0-9]|180)|40[0-9]|41[0-9]|420)$/,
    "Invalid USN, please enter your university seat number correctly"
  )
  .refine(
    (val) => {
      const year = parseInt(val.slice(3, 5));
      const number = parseInt(val.slice(-3));
      const validYears = [22, 23, 24, 25, 26];
      // Validate year and number ranges to match regex
      return (
        validYears.includes(year) &&
        ((number >= 1 && number <= 180) || (number >= 400 && number <= 420))
      );
    },
    { message: "USN must belong to batch 2022 to 2026 and have a valid number (001-180 or 400-420)" }
  );
  
export const verifyCodeValidation = z.object({
    verifyCode : z.string().length(6 , "Verify code must be of six digits"),
})

export const signupValidation = z.object({
    name : z.string().min(4 , "Name must be atleast 4 chars").max(20 , "Name cannot exceed more than 20 chars").trim().toLowerCase(),
    email : z.string().email({message : "Invalid email address"}),
    usn : usnValidation,
    department : z.string(),
    password : z.string().min(6 , {message : "Password must be atleast six chars"}),
})

export const signinValidation = z.object({
    email : z.string().email({message : "Invalid email address"}),
    password : z.string(),
})
