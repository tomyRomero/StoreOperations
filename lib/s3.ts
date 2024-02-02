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
    const cachedImage = localStorage.getItem(imgUrl)

    if(cachedImage)
    {
      return cachedImage;
    }else{
      try {
        let imgResult = '/assets/profile.png';
       
        const res = await getImageData(imgUrl);
        imgResult = res;
        
        try {
          localStorage.setItem(imgUrl, imgResult);
        } catch (e) {
          // Handle QuotaExceededError
          if (e instanceof DOMException && e.name === 'QuotaExceededError') {
            console.warn('LocalStorage quota exceeded. Removing some items from the cache.');
            // Implement cache eviction policy here
            removeOldestItemFromCache();

          }
        }

        return imgResult
        
      } catch (error) {
        console.log("Error", error);
        return '/assets/profile.png'
      }
    }
    
  }


  const removeOldestItemFromCache = () => {
    // Retrieve all keys from localStorage
    const keys = Object.keys(localStorage);
  
    if (keys.length > 0) {
      // Find the oldest item by comparing the timestamps in the keys
      const oldestKey = keys.reduce((oldest, key) =>

      //@ts-ignore
        localStorage.getItem(key) < localStorage.getItem(oldest) ? key : oldest
      );
  
      // Remove the oldest item from localStorage
      localStorage.removeItem(oldestKey);
    }
  };