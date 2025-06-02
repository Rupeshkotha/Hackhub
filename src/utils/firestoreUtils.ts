import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface ProfileData {
  name: string;
  university: string;
  experience: string;
  skills: string[];
  links: {
    github?: string;
    linkedin?: string;
    portfolio?: string;
  };
}

export const saveUserProfile = async (userId: string, profileData: ProfileData) => {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, profileData, { merge: true });
    return true;
  } catch (error) {
    console.error('Error saving profile:', error);
    throw error;
  }
}; 