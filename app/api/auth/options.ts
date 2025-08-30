import CredentialsProvider from "next-auth/providers/credentials";
import { connectDB } from "@/app/lib/db";
import bcrypt from "bcrypt";
import { NextAuthOptions } from "next-auth";
import { User } from "next-auth";
import UserModel from "@/app/model/User";

export const authOptions : NextAuthOptions = {
    providers : [
        CredentialsProvider({
            name:"Credentials",

            credentials : {
                email : {label : "Email" , type : "text" , placeholder : "email"},
                password : {label : "Password" , type : "password" , placeholder : "password"},
            },

           async authorize(credentials) : Promise <User | null> {
                if(!credentials?.email || !credentials.password){
                    throw new Error("Email and Password fields are required");
                }
                await connectDB();
                try {
                    const user = await UserModel.findOne({email : credentials.email});
                    if(!user){
                        throw new Error("User not found with email");
                    }
                    if(!user.isVerified){
                        throw new Error("User is not Verified access denied");
                    }
                    const validPassword = await bcrypt.compare(credentials.password , user.password);
                    if(!validPassword){
                        throw new Error("Invalid email or password");
                    }
                    if(user){
                        return {
                            id: user._id.toString(),
                            email: user.email,
                            usn: user.usn,
                            isVerified: user.isVerified,
                        } as User
                    } else {
                        return null;
                    }
                } catch (error : unknown) {
                    if (error instanceof Error) {
                        throw new Error(error.message || "Authorization Error");
                    }
                    throw new Error("Authorization Error");
                }
            },
        })
    ],

    callbacks : {
        async jwt({token , user}){
            if(user){
                token.id = user.id
                token.email = user.email
                token.usn = user.usn
                token.isVerified = user.isVerified
            }
            return token;
        },
        async session({session , token}){
            if(token){
                session.user.id = token.id as string
                session.user.email = token.email as string
                session.user.usn = token.usn as string
                session.user.isVerified = token.isVerified as boolean
            }
            return session
        }
    },
    pages : {
        signIn : "/sign-in",
    },
    session : {
        strategy : "jwt",
        maxAge: 2 * 24 * 60 * 60, 
        updateAge: 12 * 60 * 60,
    },
    jwt : {
        maxAge : 2 * 24 * 60 * 60,
    },
    secret : process.env.NEXTAUTH_SECRET,
}