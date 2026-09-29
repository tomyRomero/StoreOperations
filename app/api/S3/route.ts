import { NextApiResponse } from 'next';
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getEnv } from "@/lib/env";

// Created on first use so a missing setting fails the request, not the build.
// S3_ENDPOINT points at an S3-compatible server such as S3Mock in local development.
let client: S3Client | undefined;
const getClient = () => {
  if (!client) {
    const env = getEnv();
    client = new S3Client({
      region: env.AWS_REGION,
      endpoint: env.S3_ENDPOINT,
      forcePathStyle: Boolean(env.S3_ENDPOINT),
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }
  return client;
};

export const GET = async (req: any, res: NextApiResponse) => {
    try {
      // Extract the value of the "name" parameter from QUERY
      const key = req.nextUrl.searchParams.get("key");
      // console.log("Encoded Key:", key)
      const decodedKey = decodeURIComponent(key);
      // console.log("Server Side KEY:" , decodedKey);
      // Define the parameters for getObject
      const command = new GetObjectCommand({
          Bucket: getEnv().BUCKET_NAME,
          Key: `${decodedKey}`,
        });

      // Retrieve the image from S3
      const response = await getClient().send(command);
      //Take the response and parse it
      const streamToString = (stream: any) =>
      new Promise((resolve, reject) => {
          const chunks: any = [];
          stream.on("data", (chunk: any) => chunks.push(chunk));
          stream.on("error", reject);
          stream.on("end", () => resolve(Buffer.concat(chunks).toString("base64")));
      });
    
     const bodyContents = await streamToString(response.Body);

    return new Response(JSON.stringify(bodyContents), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    } catch (error) {
      console.error("Error fetching Image from S3:", error);
      return new Response("Error Getting Image From S3:", { status: 500 });
    }
  };

export const POST = async (req: any, res: NextApiResponse) => {
  const { image , name} = await req.json();

  // Determine the image format based on the content type
  const contentType = image.match(/^data:image\/(png|jpe?g|gif|webp|svg\+xml);base64,/)[1];

  // Decode the Data URL
  const base64Data = image.replace(/^data:image\/(png|jpe?g|gif|webp|svg\+xml);base64,/, '');
  const binaryImageData = Buffer.from(base64Data, 'base64');

  // Create a unique filename for the image (e.g., using a timestamp)
  const filename = `${name}.${contentType}`; // Use the determined content type in the filename

  try {
    // Define the parameters for the upload
    const command = new PutObjectCommand({
      Bucket: getEnv().BUCKET_NAME,
      Key: filename, // Provide the desired filename
      Body: binaryImageData, // Use the Buffer containing the image data
      ContentType: `image/${contentType}`, // Use the determined content type
    });

    // Upload the image to S3
    await getClient().send(command);
    return new Response(JSON.stringify({ message: "Successfully uploaded Image To S3 Bucket!", filename }), { status: 201 });
  } catch (error) {
    console.error("Error uploading image to S3:", error);
    return new Response("Error uploading Image to S3:", { status: 500 });
  }
};
