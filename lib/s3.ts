"use client"

export const getImageData = async (key: string) => {
   
    const encodedKey = encodeURIComponent(key);
    const getResponse = await fetch(`/api/S3?key=${encodedKey}`, {
      method: 'GET'
    });

    if (getResponse.ok) {
      // Request was successful, handle the response
      const getResponseData = await getResponse.json();
      const match = key.match(/[^.]+$/);
      const result = match ? match[0] : 'jpg';
      
      let base64 = `data:image/${result};base64,` + getResponseData;
      return base64;
      
    } else {
      // Request failed, handle the error
      console.error('Error:', getResponse.statusText);
      return '/assets/profile.png'
    }
  }  


  export const postImage = async (data: any) => {
    const response = await fetch('/api/S3', {
      method: 'POST',
      body: JSON.stringify(data), // Convert data to JSON
    });
    
    if (response.ok) {
      // Request was successful, handle the response
      const responseData = await response.json();
      return responseData.filename;
    } else {
      // Request failed, handle the error
      console.error('Error:', response.statusText);
      alert(`There Was An Error, Please Try Again, Error: ${response.statusText}`);
      return false;
    }
  }

  export const getRes = async (imgUrl: string)=> {
  
      try {
        let imgResult = '/assets/profile.png';
        
        // Check if the image is already in local storage
        const cachedImg = localStorage.getItem(imgUrl)
        if (cachedImg) {
            return cachedImg
        }

        // If not, fetch the image data
        const res = await getImageData(imgUrl);
        // Compress image so that local stroage does not get filled up fast
     
        imgResult = await compressImage(res);
        
  

        // Try to store the fetched image data in local storage
          try {
            localStorage.setItem(imgUrl, imgResult)
          } catch (error: unknown) {
            if (error instanceof DOMException && error.name === 'QuotaExceededError') {
              console.warn("Local storage is full, could not cache the image")
            } else {
              console.error("Error storing image in local storage", error)
            }
          }

        return imgResult
        
      } catch (error) {
        console.log("Error", error);
        return '/assets/profile.png'
      }
    }
    const compressImage = async (base64Str: string) => {
      return new Promise<string>((resolve, reject) => {
        const img = new Image();
        img.src = base64Str; // Set the image source to the base64 string
    
        img.onload = () => {
          const canvas = document.createElement('canvas'); // Create a canvas element
          const maxWidth = 300; // Set the desired maximum width
          const maxHeight = 300; // Set the desired maximum height
    
          let width = img.width;
          let height = img.height;
    
          // Resize the image maintaining the aspect ratio
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height *= maxWidth / width)); // Scale height proportionally
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width *= maxHeight / height)); // Scale width proportionally
              height = maxHeight;
            }
          }
    
          canvas.width = width; // Set the canvas width
          canvas.height = height; // Set the canvas height
    
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height); // Draw the image onto the canvas with the new dimensions
          }
    
          const quality = 1; // Set the compression quality (0 to 1, 1 is highest quality)
          const compressedBase64 = canvas.toDataURL('image/jpeg', quality); // Convert the canvas content to a base64 string
          resolve(compressedBase64); // Resolve the promise with the compressed base64 string
        };
    
        img.onerror = (error) => {
          reject(error); // Reject the promise if an error occurs while loading the image
        };
      });
    };
    