import { z } from "zod";

export const usnValidation = z.string().
length(10 , "USN must be 10 characters only").
regex(/^1AY(22|23|24|25|26)[A-Z]{2,3}(0(0[1-9]|[1-9][0-9])|1([0-7][0-9]|80))$/ , "Invalid usn please enter you university seat number correctly").refine((val)=>{
    const year = parseInt(val.slice(3 , 5));
    const number = parseInt(val.slice(-3));
    const validYears = [22 , 23 , 24 , 25 , 26];
    return validYears.includes(year) && number >= 1 && number <=180
}, {message : "Usn must belong to batch 2022 to 2026 and number between 001 and 180"});

export const verifyCodeValidation = z.object({
    verifyCode : z.string().length(6 , "Verify code must be of six digits"),
})

export const signupValidation = z.object({
    name : z.string().min(4 , "Name must be atleast 4 chars").max(20 , "Name cannot exceed more than 20 chars").trim().toLowerCase(),
    email : z.string().email({message : "Invalid email address"}),
    usn : usnValidation,
    password : z.string().length(6 , {message : "Password must be atleast six chars"}),
    department : z.string(),
})

export const signinValidation = z.object({
    email : z.string().email({message : "Invalid email address"}),
    password : z.string(),
})
