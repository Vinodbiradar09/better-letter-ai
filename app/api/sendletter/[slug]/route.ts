import { connectDB } from "@/app/lib/db";
import UserM from "@/app/model/User";
import Letter from "@/app/model/Letter";
import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@/app/helpers/currentUser";
import { LetterT } from "@/app/types/ApiRes";
import { sendLeaveLetterPdf } from "@/app/helpers/resendPdfLetter";

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    try {
        await connectDB();
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({
                message: "Unauthorized Access. Please login",
                success: false,
            }, { status: 401 });
        }

        const { slug } = await params;
        
        if (!slug) {
            return NextResponse.json({
                message: "Letter ID is required to send the email to the mentor",
                success: false,
            }, { status: 400 });
        }

        const letter = await Letter.findById(slug);
        if (!letter) {
            return NextResponse.json({
                message: "Letter not found",
                success: false,
            }, { status: 404 });
        }

        if (letter.status === 'Sent') {
            return NextResponse.json({
                message: "Letter has already been sent to the mentor",
                success: false,
            }, { status: 400 });
        }

      
        const fromUser = await UserM.findById(user.id);
        if (!fromUser) {
            return NextResponse.json({
                message: "User details not found",
                success: false,
            }, { status: 404 });
        }

        const letterPdfFormat: LetterT = {
            _id: letter._id,
            from: {
                name: fromUser.name,
                usn: fromUser.usn,
                email: fromUser.email,
            },
            to: {
                name: letter.to.name,
                email: letter.to.email,
                info: letter.to.info,
            },
            date: new Date().toISOString().split("T")[0],
            subject: letter.subject,
            body: letter.body,
        };

        console.log('Sending letter PDF to mentor:', letter.to.email);

        const emailResult = await sendLeaveLetterPdf(letterPdfFormat, letter.to.email);
        
        if (!emailResult.success) {
            return NextResponse.json({
                message: emailResult.message || "Failed to send the leave letter PDF to the mentor",
                success: false,
            }, { status: 500 });
        }
        await Letter.findByIdAndUpdate(slug, {
            status: 'Sent',
            emailSent: true,
            pdfUrl : emailResult.pdfUrl,
            publicId : emailResult.publicId,
        },{new : true , runValidators : true});

        console.log("pdf url" , emailResult.pdfUrl);
        console.log(' Letter sent successfully to:', letter.to.email);

        return NextResponse.json({
            message: "Successfully sent the leave letter PDF to mentor's email",
            success: true,
            data: {
                letterId: letter._id,
                sentTo: letter.to.email,
                sentAt: new Date().toISOString()
            }
        }, { status: 200 });

    } catch (error) {
        console.error("Error while sending the letter PDF:", error);

        return NextResponse.json({
            message: "Error while generating and sending the PDF letter",
            success: false,
        }, { status: 500 });
    }
}