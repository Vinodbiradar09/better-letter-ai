import VerificationEmail from "@/emails/VerificationEmail";
import { resend } from "../lib/resend";
import { ApiRes } from "../types/ApiRes";
import { resendVerTyp } from "../types/resendVer";

export const resendEmailVerification = async({email , usn , verifyCode} : resendVerTyp) : Promise<ApiRes> =>{
    try {
        const {data , error} = await resend.emails.send({
            from : 'vinod <vinod@skmayya.me>',
            to : email,
            subject : "BetterLetterAI | Verification code",
            react : VerificationEmail({usn , verifyCode}),
        });
        if(error){
            console.log("failed to send the email verification" , error.message);
            return {message : "failed to send the email verification for your email addrees" , success : false};
        }
        console.log("email queued successfully" , data);
        return {message : "Email verification successfully sent to your email" , success : true};

    } catch (emailError : unknown) {
        if(emailError instanceof Error){
            console.error("resend Email verification failed" , emailError.message);
            return {message : emailError.message , success : false};
        }
        console.error(" Resend Email verification failed:", emailError);
        return {message: "An unexpected error occurred while sending verification email",success: false,};
    }
}

