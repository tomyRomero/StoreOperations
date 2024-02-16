import { NextResponse } from "next/server";
import {compare, hash} from 'bcrypt';
import * as z from 'zod';
import User from "@/lib/models/user.model";
import { connectToDB } from "@/lib/mongoose";
import sanitizeHtml from 'sanitize-html';

// Define schema for input validation for added secruity from brute force attacks
const userSchema = z.object({
    id: z
    .string()
    .min(1, "Id is required"),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(9, 'Password must have at least 9 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character'),
    newPassword:  z
    .string()
    .min(1, 'Password is required')
    .min(9, 'Password must have at least 9 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character')
  });


export async function POST(req: Request, res: NextResponse){
    try{

        const body = await req.json()

        const { id, password , newPassword } = userSchema.parse(body);

        //Santize html to prevent potential injection attacks
        const sanitizedId = sanitizeHtml(id)
        const sanitizedPassword = sanitizeHtml(password);   
        const sanitizedNewPassword = sanitizeHtml(newPassword)   

        connectToDB();

        //Check if User Exists

        //By using Mongoose's built-in methods like findOne, can mitigate the risk of injection attacks like SQL injection.
        const existingUser = await User.findById(sanitizedId);;

        if(existingUser){
            const passwordMatch = await compare(sanitizedPassword , existingUser.password)
            
            if(passwordMatch)
            {
                //User inputted correct password proceed to change to new password

                //hash new password and store
                const hashedPassword = await hash(sanitizedNewPassword, 10)
                existingUser.password = hashedPassword
                
                await existingUser.save();
                
            }else{
                //Incorrect password, return response
                return NextResponse.json({ message: "Incorrect Password, Please try again with correct password."}, {status: 409})
            }
        }else{
            return NextResponse.json({ message: "User does not exist"}, {status: 409})
        }
   
       // Set secure HTTP response headers
        const headers = {
            'Content-Security-Policy': "default-src 'self'",
            'X-Content-Type-Options': 'nosniff',
        };

        return NextResponse.json(
            { message: "Password Changed Successfully" },
            { 
                status: 201,
                headers: headers
            }
        );

    }catch(error)
    {
        console.log(error)
        return NextResponse.json({message: `${error}`}, {status: 500})
    }

}
