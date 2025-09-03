import { connectDB } from "@/app/lib/db";
import { NextRequest , NextResponse } from "next/server";
import Letter from "@/app/model/Letter";
import User from "@/app/model/User";
import { currentUser } from "@/app/helpers/currentUser";
import { SearchHistoryTyp } from "@/app/types/letterTyp";

export async function GET(request : NextRequest) {
    try {
      await connectDB();
      const user = await currentUser();
      if(!user){
        return NextResponse.json(
            {
                message : "Unauthorized User , Please login",
                success : false,
            },{status : 400}
        )
      }
      const userFound = await User.findById(user.id);
      if(!userFound){
        return NextResponse.json(
            {
                message : "User not found",
                success : false,
            },{status : 404}
        )
      }
      console.log("user.id" , user.id.toString() , userFound._id.toString());
      if(userFound._id.toString() !== user.id.toString()){
        return NextResponse.json(
            {
                message : "You are not authorized to access the history",
                success : false,
            },{status : 400}
        )
      }
      // extract the search query 
      const {searchParams} = new URL(request.url);
      const searchQuery = searchParams.get("subject") || "";

      const filter : SearchHistoryTyp = {
        from : user.id,
        emailSent : true,
      }

      if(searchQuery){
        filter.subject = { $regex: searchQuery, $options: "i" };
      }
      const letters = await Letter.find(filter);
      if(!letters || letters.length === 0){
        return NextResponse.json(
            {
                message : "You have Zero Leave letters",
                success : true,
            },{status : 201}
        )
      }
      const letterHis = letters.map(lett =>({
        _idLetter : lett._id,
        pdfProxyUrl : `/api/pdfproxy?pdfUrl=${encodeURIComponent(lett?.pdfUrl || "")}`,
        subjectLetter : lett.subject,
        bodyLetter : lett.body,
      }))

      return NextResponse.json(
        {
            message : "Successfully fetched the leave letters",
            success : true,
            lettersHist : letterHis,
        },{status : 200}
      )
    } catch (error) {
        console.error("Error while accessing the leave letter history" , error);
        return NextResponse.json(
            {
                message : "Error while accessing the leave letter history",
                success : false,
            },{status : 500}
        )
    }
}