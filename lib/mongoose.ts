import mongoose from 'mongoose';

let isConnected = false; //variable to check if mongoose is connected

export const connectToDB = async () => {
    mongoose.set('strictQuery', true); 
    //to prevent unknown field queries
    if(!process.env.MONGODB_URL) return console.log('MONGODB_URL not found');
    if(isConnected) return console.log('Already connected to MonogoDB');
    try{
      const success = await mongoose.connect(process.env.MONGODB_URL);

      if(success)
      console.log("Connected to Database")
    }catch(error)
    {
        console.log(error);
    }
}