import { connectDB } from "@/app/lib/db";
import { NextRequest , NextResponse } from "next/server";
import UserM from "@/app/model/User";
import Letter from "@/app/model/Letter";
import { letterSchema } from "@/app/schemas/LetterSchema";
import { currentUser } from "@/app/helpers/currentUser";
import { LetterTyp } from "@/app/types/letterTyp";
import { generateProfessionalLetter, LetterInput } from "@/app/helpers/generateLetter";
import { LetterT } from "@/app/types/ApiRes";


export async function POST(request : NextRequest){
    try {
        await connectDB();
        const body : LetterTyp = await request.json();
        const {to , fromDate , toDate, totalDays, reason} = body;
        const user = await currentUser();
        // if(!user){
        //     return NextResponse.json(
        //         {
        //             message : "Unauthorized User",
        //             success : false,
        //         },{status : 401}
        //     )
        // }
        const from = '68b2d0f18f2cdbccef474f7a';
        const u =  await UserM.findById(from);
        const letterResult = letterSchema.safeParse({from , to , fromDate , toDate , totalDays , reason})
        if(!letterResult.success){
            const letterErrors = letterResult.error.format();
            const Errors = [
                ...(letterErrors.from?._errors || []),
                ...(letterErrors.to?.name?._errors || []),
                ...(letterErrors.to?.email?._errors || []),
                ...(letterErrors.to?.info?._errors || []),
                ...(letterErrors.fromDate?._errors || []),
                ...(letterErrors.toDate?._errors || []),
                ...(letterErrors.totalDays?._errors || []),
                ...(letterErrors.totalDays?._errors || []),
            ]
            return NextResponse.json(
                {
                    message : Errors.length > 0 ? Errors.join(", ") : "Invalid to or dates or reason format",
                    success : false,
                }, {status : 400}
            )
        }
        const input : LetterInput = {
            from : {
                name : u?.name ?? "Vinod",
                usn : u?.usn ?? "1AY22IS125",
                email : u?.email ?? "vinodj.22.beis@acharya.ac.in",
            },
            to,
            date : Date.now().toString(),
            reason,
        }
        const apiLetterRes = await generateProfessionalLetter(input);
        if(!apiLetterRes.body || !apiLetterRes.subject){
            return NextResponse.json(
                {
                    message : "oops sorry failed to generate the subject and body for the letter",
                    success : false,
                },{status : 402}
            )
        }
        const letter = await Letter.create(
            {
               from,
               to,
               fromDate,
               toDate,
               totalDays,
               reason,
               subject : apiLetterRes.subject,
               body : apiLetterRes.body,
               status : "Draft",
            }
        )

        if(!letter){
            return NextResponse.json(
                {
                    message : "Failed to create the letter instances in db",
                    success : false,
                },{status : 400}
            )
        }
        const generatedLetter : LetterT = {
            _id : letter._id,
            from : {
                name : u?.name,
                usn : u?.usn,
                email : u?.email
            },
            to,
            date : new Date().toISOString().split("T")[0],
            subject : apiLetterRes.subject,
            body : apiLetterRes.body
        }
        return NextResponse.json(
            {
                message : "Successfully letter has been generated",
                success : true,
                letter : generatedLetter,
            },{status : 200}
        )
    } catch (error) {
        console.error("Error occured while generating the letter" , error);
        return NextResponse.json(
            {
                message : "Error while generating the letter",
                success : false,
            }, {status : 500}
        )
    }
}