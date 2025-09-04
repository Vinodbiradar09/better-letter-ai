import { connectDB } from "@/app/lib/db";
import { NextRequest , NextResponse } from "next/server";
import User from "@/app/model/User";
import { usnValidation , signupValidation } from "@/app/schemas/UserSchema";
import { signupTyp } from "@/app/types/UserTyp";
import { resendEmailVerification } from "@/app/helpers/resendVerification";
import { sanitizeUser } from "@/app/helpers/sanitizedUser";

export async function POST(request : NextRequest) : Promise<NextResponse> {
    let user;
    try {
        await connectDB();
        const body : signupTyp = await request.json();
        const {name , email , usn , department , password} = body;
        const usnResult = usnValidation.safeParse(usn);
        if(!usnResult.success){
            const usnErrors = usnResult.error.format().usn?._errors() || [];
            return NextResponse.json(
                {
                    message : usnErrors.length > 0 ? usnErrors.join(", ") : "Invalid usn format",
                    success : false,
                },{status : 402}
            )
        }
        const signupResult = signupValidation.safeParse({name , email , usn , department , password});
        if(!signupResult.success){
            const errors = signupResult.error.format();
            const signupErrors = [
                ...(errors.name?._errors || []),
                ...(errors.email?._errors || []),
                ...(errors.usn?._errors || []),
                ...(errors.password?._errors || []),
                ...(errors.department?._errors || []),
            ]

            return NextResponse.json(
                {
                    message : signupErrors.length > 0 ? signupErrors.join(", ") : "Invalid email or usn or password format",
                    success : false,
                },{status : 402}
            )
        }

        const existingVerifiedUserWithUsn = await User.findOne({usn , isVerified : true});
        if(existingVerifiedUserWithUsn){
            return NextResponse.json(
                {
                    message : "Usn is taken",
                    success : false,
                },{status : 409}
            )
        }
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
        const existingUserWithEmail = await User.findOne({email});
        if(existingUserWithEmail){
            if(existingUserWithEmail.isVerified){
                user = await User.findOne({email});
                return NextResponse.json(
                    {
                        message : "User with email already exist",
                        success : false,
                    },{status : 400}
                )
            } else {
                user = await User.findOne({email})
                existingUserWithEmail.verifyCode = verifyCode;
                existingUserWithEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);
                await existingUserWithEmail.save();
            }
        } else {
            const expiryDate = new Date();
            expiryDate.setHours(expiryDate.getHours() + 1);
            const newUser = await User.create({
                name,
                email,
                usn,
                password,
                department,
                verifyCode,
                verifyCodeExpiry : expiryDate,
                isVerified : false,
            })
            if(!newUser){
                return NextResponse.json(
                    {
                        message : "failed to sign-up new user",
                        success : false,
                    },{status : 400}
                )
            }

            user = newUser;
        }

        const emailResponse = await resendEmailVerification({email , usn , verifyCode});
        if(!emailResponse){
            return NextResponse.json(
                {
                    message : "Failed to send verification code to your email",
                    success : false,
                },{status : 400}
            )
        }
        if(!user){
            return NextResponse.json(
                {
                    message : "User creation is failed",
                    success : false,
                },{status : 404}
            )
        }
        const safeUser = sanitizeUser(user);
        return NextResponse.json(
            {
                message : "User registered successfully",
                success : true,
                user : safeUser,
            },{status : 200}
        )
    } catch (error) {
         console.error("Error while sign-up user" , error);
        return NextResponse.json(
            {
                message : "Error while registering the user",
                success : false,
            } , {status : 500}
        )
    }
}