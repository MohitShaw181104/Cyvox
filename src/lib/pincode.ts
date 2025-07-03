interface PincodeResponse {
  Status: string;
  PostOffice?: Array<{
    Name: string;
    State: string;
    District: string;
  }>;
  Message?: string;
}

export async function getPincodeDetails(pincode: string): Promise<{ city: string;state: string; district:string } | null> {
  try {
    const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
    const data: PincodeResponse[] = await response.json();
    
    if (data[0].Status === "Success" && data[0].PostOffice && data[0].PostOffice.length > 0) {
      const postOffice = data[0].PostOffice[0];
      return {
        city: postOffice.Name,
        district: postOffice.District,
        state: postOffice.State
      
      };
      
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching pincode details:', error);
    return null;
  }
}
