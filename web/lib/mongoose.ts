import mongoose from 'mongoose';
import { getEnv } from './env';

let isConnected = false; //variable to check if mongoose is connected

export const connectToDB = async () => {
    mongoose.set('strictQuery', true); 
    //to prevent unknown field queries
    // Throws a readable error listing every missing or invalid variable
    const { MONGODB_URL } = getEnv();
    if(isConnected) return console.log('Already connected to MonogoDB');
    try{
      const success = await mongoose.connect(MONGODB_URL);

      if(success)
      isConnected = true;
      console.log("Connected to Database")
    }catch(error)
    {
        console.log(error);
    }
}