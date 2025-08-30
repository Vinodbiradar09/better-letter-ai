import { UserInt , UserPublic } from "../model/User";

export function sanitizeUser( user : UserInt) : UserPublic {
    return {
        _id : user._id,
        usn : user.usn,
        email : user.email,
        isVerified : user.isVerified
    }
}