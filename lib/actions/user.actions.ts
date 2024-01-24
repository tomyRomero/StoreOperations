"use server"
import { revalidatePath } from "next/cache";
import User from "../models/user.model";
import { connectToDB } from "../mongoose"

interface Params {
    userId: string,
    username: string,
    password: string,
    email: string,
    image: string,
  }
  
  export async function updateUser(
    {
      userId,
      username,
      password,
      email,
      image,
    }: Params
  ): Promise<void>{
      connectToDB();
    try{
      await User.findOneAndUpdate(
          {id: userId},
          {
              username: username.toLowerCase(),
              password,
              email,
              image, 
          },
          { upsert: true }
      );

    }catch(error : any)
    {
      throw new Error(`Failed to create/update user: ${error.message}`)
    }
  }
  
  
