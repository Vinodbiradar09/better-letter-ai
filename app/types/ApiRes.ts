import mongoose from "mongoose";
import { UserInt } from "../model/User";

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

export interface LetterData {
    data : {
        letterId : mongoose.Types.ObjectId,
        sentTo: string,
        sentAt?: string,
    }
}

export interface LetterHistory {
        _idLetter : string,
        pdfProxyUrl : string,
        subjectLetter : string,
        bodyLetter :string,
}       

export interface ApiRes {
    success : boolean,
    message : string,
    user? : UserInt,
    letter? : LetterT,
    data?: LetterData,
    lettersHist?: LetterHistory[],
}