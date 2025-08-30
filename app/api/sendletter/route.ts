import { connectDB } from "@/app/lib/db";
import UserM from "@/app/model/User";
import Letter from "@/app/model/Letter";
import { NextRequest , NextResponse } from "next/server";
import { currentUser } from "@/app/helpers/currentUser";
import { success } from "zod";

export async function POST(request : NextRequest) {
    try {
        await connectDB();
        const user = currentUser();
        if(!user){
            return NextResponse.json(
                {
                    message : "Unauthorized Access , Please login",
                    success : false,
                },{status : 401}
            )
        }
        const { letterId }  = await request.json();
        if(!letterId){
            return NextResponse.json(
                {
                    message : "Letter Id is required to send the email to the mentor",
                    success : false,
                },{status : 400}
            )
        }

        const letter = await Letter.findById(letterId);
        if(!letter){
            return NextResponse.json(
                {
                    message : "Letter Not found",
                    success : false,
                },{status : 404}
            )
        }
        
        const fromUser = await UserM.findById(letter.from);

        

    } catch (error) {
        
    }
}