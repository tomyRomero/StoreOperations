import { NextResponse } from "next/server";
import User from "../../../../lib/models/user.model";
import {hash} from 'bcrypt';
import * as z from 'zod';
import { connectToDB } from "@/lib/mongoose";
import sanitizeHtml from 'sanitize-html';
import Stripe from "stripe";


// Define schema for input validation for added secruity from brute force attacks
const userSchema = z.object({
    username: z.string().min(1, 'Username is required').max(100),
    email: z.string().min(1, 'Email is required').email('Invalid email'),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(9, 'Password must have at least 9 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character'),
  });
  
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

export async function POST(req: Request, res: NextResponse){
    try{

        const body = await req.json()

        const { email, username, password } = userSchema.parse(body);

        //Santize html to prevent potential injection attacks
        const sanitizedEmail = sanitizeHtml(email);
        const sanitizedUsername = sanitizeHtml(username);
        const sanitizedPassword = sanitizeHtml(password);      

        connectToDB();

        //Check if Email Already Exists

        //By using Mongoose's built-in methods like findOne, can mitigate the risk of injection attacks like SQL injection.
        const existingUserByEmail = await User.findOne({ email: sanitizedEmail });;

        if(existingUserByEmail){
            return NextResponse.json({ user: null, message: "User with this email already exists"}, {status: 409})
        }

        //Check if Username Already Exists
        const existingUserByUsername = await User.findOne({ username: sanitizedUsername });

        if(existingUserByUsername){
            return NextResponse.json({ user: null, message: "User with this username already exists"}, {status: 409})
        }
        
        const hashedPassword = await hash(sanitizedPassword, 10)

        //Create stripe customer and store id inside db user
        const customer = await stripe.customers.create({
            email: sanitizedEmail,
          });

        const newUser =  new User({
            username: sanitizedUsername,
            email: sanitizedEmail,
            password: hashedPassword,
            stripeId: customer.id
        }); 
        
        await newUser.save();
        
        const {password: newUserPassword, ...rest} = newUser;

   
       // Set secure HTTP response headers
        const headers = {
            'Content-Security-Policy': "default-src 'self'",
            'X-Content-Type-Options': 'nosniff',
        };

        return NextResponse.json(
            { message: "User created successfully" },
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
