import { createEmailTemplate } from "@/emails/CreateEmailTemplate";
import { resend } from "../lib/resend";
import { LetterT } from "../types/ApiRes";
import { generateLeaveLetterPDF } from "./letterPdf";
import { uploadLetterPDFToCloudinary } from "./cloudinary";
import Letter from "../model/Letter";
import pRetry from "p-retry";

export async function sendLeaveLetterPdf(
    letterData: LetterT,
    mentorEmail: string
): Promise<{ success: boolean; message: string; emailId?: string; pdfUrl?: string; publicId?: string }> {
    try {
        // Validate inputs
        if (!letterData._id) {
            throw new Error("Letter ID is required");
        }
        if (!mentorEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mentorEmail)) {
            throw new Error("Invalid mentor email address");
        }
        if (!letterData.subject || !letterData.body) {
            throw new Error("Letter subject and body are required");
        }

        const newLetterData = await Letter.findById(letterData._id);
        if (!newLetterData) {
            throw new Error("Letter data not found in database");
        }

        const pdfBuffer = await generateLeaveLetterPDF(letterData);
        if (!pdfBuffer || pdfBuffer.length === 0) {
            throw new Error("Failed to generate PDF: empty buffer");
        }

        // Check PDF size (Resend has a 10MB limit for attachments)
        const pdfSizeMB = pdfBuffer.length / (1024 * 1024);
        if (pdfSizeMB > 10) {
            throw new Error(`PDF size (${pdfSizeMB.toFixed(2)}MB) exceeds Resend's 10MB limit`);
        }
        console.log(`PDF size: ${pdfSizeMB.toFixed(2)}MB`);

        console.log("Uploading PDF to Cloudinary");
        const cloudinaryResult = await uploadLetterPDFToCloudinary(pdfBuffer, letterData);
        if (!cloudinaryResult.success) {
            console.error("Cloudinary upload failed:", cloudinaryResult);
            throw new Error("Failed to upload PDF to Cloudinary");
        }
        console.log("PDF uploaded successfully to Cloudinary");

        const subject = `Leave Letter - ${letterData.from.name} (${letterData.from.usn})`;
        const filename = `${letterData.from.usn}_Leave_Letter_${new Date().toISOString().split('T')[0]}.pdf`;

        // Retry email sending with a 15-second timeout
        const emailResult = await pRetry(
            async () => {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 15000); // 15-second timeout
                try {
                    const result = await resend.emails.send(
                        {
                            from: 'BetterLetter <vinod@skmayya.me>',
                            to: mentorEmail,
                            subject,
                            html: createEmailTemplate(letterData),
                            attachments: [
                                {
                                    filename,
                                    content: pdfBuffer.toString("base64"),
                                },
                            ],
                        },
                    );
                    clearTimeout(timeoutId);
                    return result;
                } catch (error) {
                    clearTimeout(timeoutId);
                    throw error;
                }
            },
            {
                retries: 3,
                minTimeout: 1000,
                factor: 2,
                onFailedAttempt: (error) => {
                    console.warn(`Email send attempt ${error.attemptNumber} failed: ${error}`);
                },
            }
        );

        if (emailResult.error || !emailResult.data?.id) {
            console.error("Email sending failed after retries:", emailResult.error, emailResult.data);
            throw new Error(`Email sending failed: ${emailResult.error?.message || 'Unknown error'}`);
        }

        console.log("Email queued successfully:", emailResult.data.id);
        return {
            success: true,
            message: "Email sent successfully with PDF attachment",
            emailId: emailResult.data.id,
            pdfUrl: cloudinaryResult.secureUrl,
            publicId: cloudinaryResult.publicId,
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : "An unexpected error occurred";
        console.error("Error in sendLeaveLetterPdf:", message, error);
        return { success: false, message };
    }
}