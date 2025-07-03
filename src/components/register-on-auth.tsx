import { useUser } from "@clerk/clerk-react";
import axios from "axios";
import { useEffect } from "react";

export function RegisterOnAuth() {
  const { user, isSignedIn } = useUser();

  useEffect(() => {
    if (isSignedIn && user) {
      // Check localStorage to avoid duplicate registration
      const registeredFlag = localStorage.getItem(`registered_${user.id}`);
      if (registeredFlag === "true") return;

      const registerUser = async () => {
        try {
          const data = new FormData();
          data.append("username", user.fullName || user.username || user.firstName || "");
          data.append("email", user.emailAddresses[0]?.emailAddress || "");
          data.append("phoneNumber", user.phoneNumbers[0]?.phoneNumber || "");
          data.append("clerkUserId", user.id);

          // Log FormData entries before sending
        //   for (let pair of data.entries()) {
        //     console.log(pair[0]+ ': ' + pair[1]);
        //   }

          // If you want to send an audio file, you can append it here:
          // data.append("audio", someAudioFile);

          const response = await axios.post(
            `${import.meta.env.VITE_BACKEND_URL}/auth/register`,
            data,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );
          // Only set the flag if registration was successful (201 Created)
          if (response.status === 201) {
            localStorage.setItem(`registered_${user.id}`, "true");
          }
        } catch (err) {
          // Handle error (user may already exist, etc.)
          console.error("Registration error:", err);
        }
      };
      registerUser();
    }
  }, [isSignedIn, user]);

  return null; // This component doesn't render anything
}
