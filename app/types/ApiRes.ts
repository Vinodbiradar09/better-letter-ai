import { UserInt } from "../model/User";
import { LetterInt } from "../model/Letter";

export interface ApiRes {
    success : boolean,
    message : string,
    user? : UserInt,
    letter? : LetterInt,
}