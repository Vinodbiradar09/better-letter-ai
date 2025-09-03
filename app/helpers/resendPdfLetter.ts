import { createEmailTemplate } from "@/emails/CreateEmailTemplate";
import { resend } from "../lib/resend";
import { LetterT } from "../types/ApiRes";
import { generateLeaveLetterPDF } from "./letterPdf";
import { uploadLetterPDFToCloudinary } from "./cloudinary";

export async function sendLeaveLetterPdf(letterData: LetterT, mentorEmail: string) : Promise<{success : boolean , message : string , emailId?:string ,  pdfUrl?:string }> {
  try {
    const pdfBuffer = await generateLeaveLetterPDF(letterData);
    if(!pdfBuffer || pdfBuffer.length === 0){
        throw new Error("Failed to generate the pdf , the lenght is 0");
    }
    const cloudinaryUpload = uploadLetterPDFToCloudinary(pdfBuffer , letterData);
    const subject = `Leave Letter - ${letterData.from.name} (${letterData.from.usn})`;
    const filename = `${letterData.from.usn}_Leave_Letter_${new Date().toISOString().split('T')[0]}.pdf`;

    const emailPromise = await resend.emails.send({
      from: 'BetterLetter <vinod@skmayya.me>',
      to: mentorEmail,
      subject,
      html: createEmailTemplate(letterData),
      attachments: [
        {
          filename,
          content: pdfBuffer.toString("base64"),
        }
      ]
    });

    const [emailResult , cloudinaryResult] = await Promise.all([emailPromise , cloudinaryUpload]);

    if (emailResult.error) {
      console.log("letter data" , letterData , mentorEmail);
      console.error("Error while sending the pdf letter:", emailResult.error);
     throw new Error(`Email sending failed: ${emailResult.error.message || 'Unknown error'}`);
    }

    console.log("Email queued successfully:", emailResult.data.id);
    return {
        success : true,
        message : "Email sent successfully with PDF attachments",
        emailId : emailResult.data.id,
        pdfUrl : cloudinaryResult.success ? cloudinaryResult.secureUrl : undefined,
    }
  } catch (emailError: unknown) {
    if (emailError instanceof Error) {
      console.error("Resend Email PDF sending process failed:", emailError.message);
      return { message: emailError.message, success: false };
    }
    console.error("Unexpected error during email PDF sending:", emailError);
    return { message: "An unexpected error occurred while sending PDF to mentor email", success: false };
  }
}
