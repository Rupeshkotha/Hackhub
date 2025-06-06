import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export interface Skill {
  name: string;
  category: 'frontend' | 'backend' | 'ml' | 'design' | 'devops' | 'other';
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface Experience {
  id: string;
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
  technologies: string[];
  type: 'work' | 'internship' | 'hackathon' | 'project';
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  major: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  relevantCoursework: string[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  role: string;
  startDate: string;
  endDate: string;
  demoLink?: string;
  repoLink?: string;
}

export interface UserProfileData {
  name: string;
  title: string;
  bio: string;
  location: string;
  timezone: string;
  email: string;
  phone?: string;
  profilePicture?: string;
  technicalSkills: Skill[];
  softSkills: string[];
  languages: string[];
  tools: string[];
  experiences: Experience[];
  education: Education[];
  projects: Project[];
  links: {
    github?: string;
    linkedin?: string;
    portfolio?: string;
    devpost?: string;
    twitter?: string;
    other?: string[];
  };
}

export const saveUserProfile = async (userId: string, profileData: UserProfileData) => {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, profileData, { merge: true });
    return true;
  } catch (error) {
    console.error('Error saving profile:', error);
    throw error;
  }
};

// Function to get user profile data
export const getUserProfileData = async (userId: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      return userDoc.data() as UserProfileData;
    } else {
      return null; // Profile not found
    }
  } catch (error) {
    console.error('Error getting profile:', error);
    throw error;
  }
}; 