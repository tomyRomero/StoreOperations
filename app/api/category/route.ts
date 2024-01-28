
import { connectToDB } from '@/lib/mongoose';
import { isBase64Image } from '@/lib/utils';
import { nanoid } from 'nanoid';
import axios from 'axios';
import { NextResponse } from 'next/server';
import Category from '@/lib/models/category.model';
import { revalidatePath } from "next/cache";

//Use Axios to make api request amongst api, server to server
const postImage = async (data: any) => {
    try {
      const currentURL = process.env.AXIOS_URL;
  
      const response = await axios.post(`${currentURL}/api/S3`, data);
      const filename = response.data.filename;
  
      console.log('axios Success:', filename);
      return filename;
    } catch (error) {
      console.error('axios Error:', error);
      return false;
    }
  };

  const getImageData = async (key: string ): Promise<string | boolean> => {
    try {
      const encodedKey = encodeURIComponent(key);
      const currentURL = process.env.AXIOS_URL;
  
      // Use Axios for the GET request
      const getResponse = await axios.get(`${currentURL}/api/S3?key=${encodedKey}`);
  
      if (getResponse.status === 200) {
        // Request was successful, handle the response
        const getResponseData = getResponse.data;
        const match = key.match(/[^.]+$/);
        const result = match ? match[0] : 'jpg';
  
        let base64 = `data:image/${result};base64,` + getResponseData;
        console.log('Success! Axios Server response:');
        return base64;
      } else {
        // Request failed, handle the error
        console.error('Error:', getResponse.statusText);
        return false;
      }
    } catch (error) {
      console.error('Error:', error);
      return "";
    }
  };
  

export async function POST(req: Request){

    const body = await req.json()
    let { id, title, photo } = body;

    connectToDB();
    const pictureId = nanoid()
    const blob = photo;
    const data ={
      image : blob,
      name : `${pictureId}_category_picture`
    }

    //Logic to upload to S3 bucket and Update/Create Category
    try{
      if(blob)
      {
       const hasImageChanged = isBase64Image(blob);
        //Start here maybe
       if (hasImageChanged) 
       {
        const imgRes = await postImage(data);

        if(imgRes.length > 0)
        {
            const imgGetRes = await getImageData(imgRes);
            if(imgGetRes)
            {
                console.log("Passed both post and get tests with flying colors!")
                photo = imgRes;
            }
        }
        console.log("Final to Add" , id, title, photo)
      }

      const existing = await Category.findOne({id : id});

      if(!existing)
      {
        await Category.create(
            {
                title: title,
                photo: photo
            }
        )
      }else{
        existing.title = title;
        existing.photo = title;
        await existing.save();
      }
    }

    revalidatePath("/admincategories")
    return NextResponse.json({ message: "Category successfully created/updated"}, {status: 201})
}catch(error)
{
    console.log(error)
    return NextResponse.json({ message: `Error Occured: ${error}`}, {status: 500})
}
}
