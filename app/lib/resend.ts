import { Resend } from "resend";
const resendApiKey = process.env.RESEND_API_KEY;
if(!resendApiKey){
    throw new Error("resend api key is missing");
}
export const resend = new Resend(resendApiKey);
