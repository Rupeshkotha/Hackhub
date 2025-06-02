import { doc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

interface UserProfileData {
  name?: string;
  university?: string;
  experience?: string;
  skills?: string[];
  links?: { name: string; url: string }[];
  // Add other profile fields here as needed
}

export const saveUserProfile = async (userId: string, profileData: UserProfileData) => {
  if (!userId) {
    console.error("Cannot save profile: User ID is missing.");
    return;
  }

  try {
    const userDocRef = doc(db, "users", userId);
    await setDoc(userDocRef, profileData, { merge: true });
    console.log("User profile saved successfully for user:", userId);
  } catch (error: any) {
    console.error("Error saving user profile:", error.message);
    throw error; // Re-throw to allow calling component to handle it
  }
}; 