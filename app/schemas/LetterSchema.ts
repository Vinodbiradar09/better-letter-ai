import { z } from "zod";

const minWords = (min: number, fieldName: string) =>
  z.string().refine(
    (val) => val.trim().split(/\s+/).length >= min,
    `${fieldName} must be at least ${min} words`
);

export const letterSchema = z.object({
    from : z.string(),
    to : z.object({
        name : z.string().trim().min(4 , {message : "Mentors name must be atleast 4 chars"}).toLowerCase(),
        email : z.string().email({message : "Invalid email addreess of the mentor"}),
        info : z.string().optional(),
    }),
    fromDate: z.coerce.date({ message: "From Date is required" }),
    toDate: z.coerce.date({ message: "To Date is required" }),
    totalDays: z
    .number()
    .min(1, "At least 1 day is required")
    .max(365, "Leave cannot exceed 1 year"),
    reason : minWords(5 , "Reason"),
    subject : minWords(5 , "Subject"),
    body : minWords(25 , "Body"),
    status : z.enum(["Draft" , "Sent"]).default("Draft"),
    pdfUrl : z.string().url().optional(),
    emailSent : z.boolean().default(false),
})
