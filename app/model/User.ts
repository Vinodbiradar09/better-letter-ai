import mongoose , {model , Schema , Document , models , Model} from "mongoose";
import bcrypt from "bcrypt";

export interface UserInt extends Document{
    _id : mongoose.Types.ObjectId,
    name : string,
    email : string,
    usn : string,
    password : string,
    department : string,
    verifyCode : string,
    verifyCodeExpiry : Date,
    isVerified : boolean,
}

export interface UserPublic {
  _id: mongoose.Types.ObjectId;
  usn: string;
  email: string;
  isVerified: boolean;
}


const userSchema = new Schema<UserInt>(
    {
        name : {
            type : String,
            required : [true , "Name is required"],
            lowercase : true,
            trim : true,
            minLength : [4 , "Name must be atleast 4 chars"],
            maxLength : [20 , "Name can't exceed more than 20 chars"]
        },
        email : {
            type : String,
            unique : [true , "Email must be unique"],
            required : [true , "Email address is required"],
            match : [ /^[^\s@]+@[^\s@]+\.[^\s@]+$/, "please use the valid email address"],
            index : true,
        },
        usn : {
            type : String,
            unique : [true , "Usn must be unique"],
            required : [true , "Usn is required"],
            uppercase : true,
            match : [/^1AY(22|23|24|25|26)[A-Z]{2,3}((00[1-9]|0[1-9][0-9]|1[0-7][0-9]|180)|40[0-9]|41[0-9]|420)$/ , "Invalid USN format"],
            index : true,
        },
        password : {
            type : String,
            required : [true , "Password is required"],
            minLength : [6 , "Password must be atleast six chars or digits"],
        },
        department : {
            type : String,
            required : [true , "Department is required"],
        },
        verifyCode : {
            type : String,
            required : [true , "Verify Code is required"],
        },
        verifyCodeExpiry : {
            type : Date,
            required : [true , "Verify Code Expiry is required"],
        },
        isVerified : {
            type : Boolean,
            default : false,
        }
    },
    {
        timestamps : true,
    }
)

userSchema.pre("save" , async function (next) {
    if(this.isModified('password')){
        this.password = await bcrypt.hash(this.password , 10);
    } 
    next();
})

const User : Model<UserInt> = models?.User as mongoose.Model<UserInt> || model<UserInt>("User" , userSchema);

export default User;