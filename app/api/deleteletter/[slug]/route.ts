import { connectDB } from "@/app/lib/db";
import { currentUser } from "@/app/helpers/currentUser";
import Letter from "@/app/model/Letter";
import UserM from "@/app/model/User";
import { NextResponse , NextRequest } from "next/server";

export async function DELETE(request : NextRequest , {params} : {params : Promise<{slug : string}>}) {
    try {
        await connectDB();
        const user = await currentUser();
        if(!user){
            return NextResponse.json(
                {
                    message : "Unauthorized User, please login",
                    success : false,
                },{status : 401}
            )
        }
        const {slug} = await params;
        if(!slug){
            return NextResponse.json(
                {
                    message : "Slug is required to delete the leave letter history",
                    success : false,
                },{status : 400}
            )
        }
        const loggedUser = await UserM.findById(user.id);
        if(!loggedUser){
            return NextResponse.json(
                {
                    message : "User not found",
                    success : false,
                },{status : 400}
            )
        }
        if(user.id !== loggedUser._id){
            return NextResponse.json(
                {
                    message : "You are not allowed to delete the leave letter",
                    success : false,
                },{status : 400}
            )
        }

        const letterDel = await Letter.findByIdAndDelete(slug);
        if(!letterDel){
            return NextResponse.json(
                {
                    message : "Failed to delete the leave letter",
                    success : false,
                },{status : 400}
            )
        }
        return NextResponse.json(
            {
                message : "Successfully deleted the leave letter",
                success : true,
            },{status : 200}
        )
    } catch (error) {
        console.error("Error occured while deleting the leave letter" , error);
        return NextResponse.json(
            {
                message : "Error while deleting the leave letter",
                success : false,
            },{status : 500}
        )
    }
}