import { NextResponse } from "next/server";
import User from "../../../../lib/models/user.model";
import {hash} from 'bcrypt';
import * as z from 'zod';
import { connectToDB } from "@/lib/mongoose";

// Define schema for input validation
const userSchema = z
  .object({
    username: z.string().min(1, 'Username is required').max(100),
    email: z.string().min(1, 'Email is required').email('Invalid email'),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(8, 'Password must have than 8 characters'),
  })


export async function POST(req: Request){
    try{
        const body = await req.json()

        const { email, username, password } = userSchema.parse(body);

        connectToDB();

        //Check if Email Already Exists
        const existingUserByEmail = await User.findOne({ email: email });;

        if(existingUserByEmail){
            return NextResponse.json({ user: null, message: "User with this email already exists"}, {status: 409})
        }

        //Check if Username Already Exists
        const existingUserByUsername = await User.findOne({ username: username });

        if(existingUserByUsername){
            return NextResponse.json({ user: null, message: "User with this username already exists"}, {status: 409})
        }
        
        const hashedPassword = await hash(password, 10)

        // Create a new user
        const newUser =  await User.create({
            // : username.toLowerCase(),
            username: username,
            email,
            password: hashedPassword
        }); 
        
        const {password: newUserPassword, ...rest} = newUser;

        return NextResponse.json({ user: newUser, message: "User created successfully"}, {status: 201})
    }catch(error)
    {
        return NextResponse.json({message: `Something went wrong! ${error}`}, {status: 500})
    }

}