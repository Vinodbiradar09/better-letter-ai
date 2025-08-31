import mongoose , {model , Schema , Document , models , Model} from "mongoose";

export interface LetterInt extends Document{
    _id : mongoose.Types.ObjectId,
    from : mongoose.Types.ObjectId,
    to : {
        name : string,
        email : string,
        info : string,
    },
    fromDate : Date,
    toDate : Date,
    totalDays : number,
    reason : string,
    subject : string,
    body : string,
    status : "Draft" | "Sent",
    pdfUrl? : string,
    emailSent : boolean,
    // createdAt?: Date,
}

const letterSchema = new Schema<LetterInt>(
    {
        from : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "User",
            required : [true , "User is required"],
            index : true,
        },
        to : {
            name : {
                type : String,
                required : true,
            },
            email : {
                type : String,
                required : true,
            },
            info : {
                type : String,
            }
        },
        fromDate : {
            type : Date,
            required : [true , "From Date is required"],
        },
        toDate : {
            type : Date,
            required : [true , "To Date is required"],
        },
        totalDays : {
            type : Number,
            required : [true , "Total Days is required"],
        },
        reason : {
            type : String,
            required : [true , "Reason is required"],
            minLength : [10 , "Atleast 10 chars is required"],
        },
        subject : {
            type : String,
            required : [true , "Subject is required"],
            minLength : [10 , "Atleast 10 chars is required"],
        },
        body : {
            type : String,
            required : [true , "Body is required"],
            minLength : [25 , "Atleast 25 chars is required"],
        },
        status : {
            type : String,
            enum : ["Draft" , "Sent"],
            default : "Draft",
        },
        pdfUrl : {
            type : String,
        },
        emailSent : {
            type : Boolean,
        }
    },
    {
        timestamps : true,
    }
)

const Letter : Model<LetterInt> = models?.Letter as mongoose.Model<LetterInt> || model("Letter" , letterSchema);

export default Letter;