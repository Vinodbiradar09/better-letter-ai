import mongoose from "mongoose";
import { UserInt } from "../model/User";
// import { LetterInt } from "../model/Letter";

export interface LetterT {
    _id : mongoose.Types.ObjectId,
    from : {
        name?: string,
        usn?: string,
        email?: string,
    },
    to : {
        name : string,
        email : string,
        info : string,
    },
    date : string,
    subject : string,
    body : string,
}

export interface ApiRes {
    success : boolean,
    message : string,
    user? : UserInt,
    letter? : LetterT,
}