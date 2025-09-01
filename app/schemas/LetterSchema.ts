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
    totalDays: z.coerce
    .number()
    .min(1, "At least 1 day is required")
    .max(365, "Leave cannot exceed 1 year"),
    reason : minWords(5 , "Reason"),
})


export const LetterFeSchema = z.object({
 to : z.object({
        name : z.string().trim().min(4 , {message : "Mentors name must be atleast 4 chars"}),
        email : z.string().email({message : "Invalid email addreess of the mentor"}),
        info: z.string().min(1, "Mentor designation is required"),
    }),
  fromDate: z.string().min(1, "From date is required"),
  toDate: z.string().min(1, "To date is required"),
  totalDays: z.number().min(1, "Total days must be at least 1"),
 reason : minWords(5 , "Reason"),
}).refine((data) => {
  const fromDate = new Date(data.fromDate);
  const toDate = new Date(data.toDate);
  return toDate >= fromDate;
}, {
  message: "To date must be same as or after from date",
  path: ["toDate"],
});
