import { currentUser } from "@/app/helpers/currentUser";
import { NextRequest , NextResponse } from "next/server";
import UserM from "@/app/model/User";
import { connectDB } from "@/app/lib/db";
import Letter from "@/app/model/Letter";

export async function GET(request : NextRequest) {
    try {
        await connectDB();
        const user = await currentUser();
        if(!user || !user.email || !user.id){
            return NextResponse.json(
                {
                    message : "Unauthorized User , Please login",
                    success : false,
                },{status : 401}
            )
        }
        const loggedUser = await UserM.findById(user.id);
        if(!loggedUser){
            return NextResponse.json(
                {
                    message : "User not found",
                    success : false
                },{status : 404}
            )
        }
        if(user.id.toString() !== loggedUser._id.toString()){
            return NextResponse.json(
                {
                    message : "You are not authorized to access this link",
                    success : false,
                },{status : 404}
            )
        }
        const {searchParams} = new URL(request.url);
        const pdfUrl = searchParams.get("pdfUrl");
        if(!pdfUrl){
            return NextResponse.json(
                {
                    message : "Missing the pdfUrl parameter",
                    success : false,
                },{status : 400}
            )
        }

        const pdfLetterUrl = await Letter.findOne({
            from : loggedUser._id,
            pdfUrl : pdfUrl,
        })

        if(!pdfLetterUrl){
            return NextResponse.json(
                {
                    message : "Your are not the owner of that pdf you can't access it",
                    success : false,
                },{status : 404}
            )
        }
       
        const cloudinaryBase = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`;
        if(!pdfUrl.startsWith(cloudinaryBase)){
            return NextResponse.json(
                {
                    message : "Invalid or unauthorized url",
                    success : false,
                },{status : 400}
            )
        }
        const cloudRes = await fetch(pdfUrl);
        if(!cloudRes.ok || !cloudRes.body){
            return NextResponse.json(
                {
                    message : "failed to fetch the pdf from the cloudinary",
                    success : false,
                },{status : cloudRes.status}
            )
        }

        return new NextResponse(cloudRes.body , {
            status : 200,
            headers : {
                "Content-Type": "application/pdf",
                "Content-Disposition": "inline",
            }
        })
    } catch (error) {
        console.error("Error in pdf Proxy route" , error);
        return NextResponse.json({
            message : "Internal server error can't access the proxy pdf url",
            success : false,
        },{status : 500})
    }
}