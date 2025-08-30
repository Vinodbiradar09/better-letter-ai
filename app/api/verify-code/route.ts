import { connectDB } from "@/app/lib/db";
import { NextResponse , NextRequest } from "next/server";
import { verifyCodeValidation } from "@/app/schemas/UserSchema";
import { verifyCodeTyp } from "@/app/types/UserTyp";
import User from "@/app/model/User";

export async function POST(request : NextRequest) : Promise<NextResponse>{
    try {
        await connectDB();
        const body : verifyCodeTyp = await request.json();
        const {usn , verifyCode} = body;
        const decodedUsn = decodeURIComponent(usn);
        const verifyCodeResult = verifyCodeValidation.safeParse({verifyCode});
        if(!verifyCodeResult.success){
            const codeErrors = verifyCodeResult.error.format().verifyCode?._errors || [];
            return NextResponse.json(
                {
                    message : codeErrors.length > 0 ? codeErrors.join(", ") : "Invalid Code format please enter valid code",
                    success : false,
                },{status : 400}
            )
        }
        const user = await User.findOne({usn : decodedUsn});
        if(!user){
            return NextResponse.json(
                {
                    message : `No user found with ${decodedUsn} usn`,
                    success : false,
                },{status : 402}
            )
        }
        const isValidCode = user.verifyCode === verifyCode;
        const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();
        if(isValidCode && isCodeNotExpired){
            await User.findByIdAndUpdate(user._id , {
                $set : {
                    isVerified : true,
                }
            }, {new : true , runValidators : true})

            return NextResponse.json(
                {
                    message : "Account verified successfully",
                    success : true,
                },{status : 200}
            )
        } else if(!isCodeNotExpired){
            return NextResponse.json(
                {
                    message : "The verify code has been expired, please sign-up again to get the new code",
                    success : false
                },{status : 400}
            )
        } else {
            return NextResponse.json(
                {
                    message : "Invalid code , please enter the valid code",
                    success : false,
                },{status : 400}
            )
        }
    } catch (error) {
        console.error("Error occured while verifying the user" , error);
        return NextResponse.json(
            {
                message : "Error while verifying the user",
                success : false,
            },{status : 500}
        )
    }
}