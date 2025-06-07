import { db } from '../firebase';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  skills: string[];
  avatar?: string;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  hackathonId: string;
  hackathonName: string;
  teamCode: string;
  members: TeamMember[];
  requiredSkills: string[];
  maxMembers: number;
  createdAt: Date;
  createdBy: string;
  joinRequests?: string[];
}

// Generate a unique team code
const generateTeamCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// Create a new team
export const createTeam = async (teamData: Omit<Team, 'id' | 'teamCode'>): Promise<string> => {
  try {
    // Generate a unique team code
    const teamCode = generateTeamCode();
    
    // Create the team document with all required fields
    const teamRef = doc(collection(db, 'teams'));
    
    // Convert Date to Firestore Timestamp
    const createdAt = teamData.createdAt instanceof Date 
      ? teamData.createdAt 
      : new Date();

    // Ensure all fields have default values and are in the correct format
    const newTeam = {
      id: teamRef.id,
      teamCode,
      name: teamData.name || '',
      description: teamData.description || '',
      requiredSkills: Array.isArray(teamData.requiredSkills) ? teamData.requiredSkills : [],
      maxMembers: typeof teamData.maxMembers === 'number' ? teamData.maxMembers : 4,
      hackathonId: teamData.hackathonId || '',
      hackathonName: teamData.hackathonName || '',
      members: Array.isArray(teamData.members) ? teamData.members.map(member => ({
        id: member.id || '',
        name: member.name || 'Anonymous',
        role: member.role || 'Member',
        skills: Array.isArray(member.skills) ? member.skills : [],
        ...(member.avatar ? { avatar: member.avatar } : {})
      })) : [],
      createdAt,
      createdBy: teamData.createdBy || '',
      joinRequests: Array.isArray(teamData.joinRequests) ? teamData.joinRequests : []
    };

    // Validate required fields
    if (!newTeam.hackathonId || !newTeam.hackathonName || !newTeam.createdBy) {
      throw new Error('Missing required fields');
    }

    console.log('Creating new team with data:', newTeam);
    await setDoc(teamRef, newTeam);
    return teamRef.id;
  } catch (error) {
    console.error('Error creating team:', error);
    throw error;
  }
};

// Get a team by code
export const getTeamByCode = async (teamCode: string): Promise<Team | null> => {
  const teamsQuery = query(
    collection(db, 'teams'),
    where('teamCode', '==', teamCode)
  );
  const teamsSnapshot = await getDocs(teamsQuery);
  if (teamsSnapshot.empty) return null;
  const doc = teamsSnapshot.docs[0];
  return { ...doc.data(), id: doc.id } as Team;
};

// Get a team by ID
export const getTeam = async (teamId: string): Promise<Team | null> => {
  const teamRef = doc(db, 'teams', teamId);
  const teamDoc = await getDoc(teamRef);
  if (!teamDoc.exists()) return null;
  return { ...teamDoc.data(), id: teamDoc.id } as Team;
};

// Get all teams for a user
export const getUserTeams = async (userId: string): Promise<Team[]> => {
  const teamsQuery = query(
    collection(db, 'teams'),
    where('members', 'array-contains', { id: userId })
  );
  const teamsSnapshot = await getDocs(teamsQuery);
  return teamsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }) as Team);
};

// Update a team
export const updateTeam = async (teamId: string, updates: Partial<Team>): Promise<void> => {
  console.log('updateTeam called with:', { teamId, updates });
  
  const teamRef = doc(db, 'teams', teamId);
  const teamDoc = await getDoc(teamRef);
  
  if (!teamDoc.exists()) {
    throw new Error('Team not found');
  }

  const currentTeam = teamDoc.data() as Team;
  console.log('Current team data:', currentTeam);

  // Create the update object with only defined fields
  const updateData: { [key: string]: any } = {};
  
  // Only include fields that are defined in the updates
  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.description !== undefined) updateData.description = updates.description;
  if (updates.requiredSkills !== undefined) {
    updateData.requiredSkills = Array.isArray(updates.requiredSkills) ? updates.requiredSkills : [];
  }
  if (updates.maxMembers !== undefined) updateData.maxMembers = updates.maxMembers;
  if (updates.hackathonId !== undefined) updateData.hackathonId = updates.hackathonId;
  if (updates.hackathonName !== undefined) updateData.hackathonName = updates.hackathonName;
  if (updates.members !== undefined) updateData.members = updates.members;
  if (updates.joinRequests !== undefined) updateData.joinRequests = updates.joinRequests;

  console.log('Final update data:', updateData);

  // Update the document with only the defined fields
  await updateDoc(teamRef, updateData);
  console.log('Update completed');
};

// Delete a team
export const deleteTeam = async (teamId: string): Promise<void> => {
  const teamRef = doc(db, 'teams', teamId);
  await deleteDoc(teamRef);
};

// Add a member to a team
export const addTeamMember = async (teamId: string, member: TeamMember): Promise<void> => {
  const teamRef = doc(db, 'teams', teamId);
  const teamDoc = await getDoc(teamRef);
  
  if (!teamDoc.exists()) {
    throw new Error('Team not found');
  }

  const team = teamDoc.data() as Team;
  
  // Check if member already exists
  if (team.members.some(m => m.id === member.id)) {
    throw new Error('Member already exists in the team');
  }

  // Check if team is full
  if (team.members.length >= team.maxMembers) {
    throw new Error('Team is full');
  }

  // Create new member object without undefined values
  const newMember = {
    id: member.id,
    name: member.name || 'Anonymous',
    role: member.role || 'Member',
    skills: member.skills || [],
    ...(member.avatar ? { avatar: member.avatar } : {})
  } as TeamMember;

  // Add new member to the array
  const updatedMembers = [...team.members, newMember];
  
  await updateDoc(teamRef, {
    members: updatedMembers,
  });
};

// Remove a member from a team
export const removeTeamMember = async (teamId: string, memberId: string): Promise<void> => {
  const teamRef = doc(db, 'teams', teamId);
  const teamDoc = await getDoc(teamRef);
  if (!teamDoc.exists()) return;

  const team = teamDoc.data() as Team;
  const updatedMembers = team.members.filter(member => member.id !== memberId);
  
  await updateDoc(teamRef, {
    members: updatedMembers,
  });
};

// Search teams by skills
export const searchTeamsBySkills = async (skills: string[]): Promise<Team[]> => {
  const teamsQuery = query(
    collection(db, 'teams'),
    where('requiredSkills', 'array-contains-any', skills)
  );
  const teamsSnapshot = await getDocs(teamsQuery);
  return teamsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }) as Team);
};

// Get available teams (not full)
export const getAvailableTeams = async (): Promise<Team[]> => {
  const teamsQuery = query(collection(db, 'teams'));
  const teamsSnapshot = await getDocs(teamsQuery);
  return teamsSnapshot.docs
    .map(doc => ({ ...doc.data(), id: doc.id }) as Team)
    .filter(team => team.members.length < team.maxMembers);
};

// Add a join request to a team
export const addJoinRequest = async (teamId: string, userId: string): Promise<void> => {
  const teamRef = doc(db, 'teams', teamId);
  await updateDoc(teamRef, {
    joinRequests: arrayUnion(userId),
  });
};

// Remove a join request from a team (optional, but good to have)
export const removeJoinRequest = async (teamId: string, userId: string): Promise<void> => {
  const teamRef = doc(db, 'teams', teamId);
  const teamDoc = await getDoc(teamRef);
  if (!teamDoc.exists()) return;

  const team = teamDoc.data() as Team;
  const updatedRequests = team.joinRequests?.filter(request => request !== userId) || [];

  await updateDoc(teamRef, {
    joinRequests: updatedRequests,
  });
};

// Accept a join request
export const acceptJoinRequest = async (teamId: string, member: TeamMember): Promise<void> => {
  const teamRef = doc(db, 'teams', teamId);
  const teamDoc = await getDoc(teamRef);

  if (!teamDoc.exists()) {
    throw new Error('Team not found');
  }

  const team = teamDoc.data() as Team;

   // Check if the user is already a member
   if (team.members.some(m => m.id === member.id)) {
    throw new Error('User is already a member of the team');
   }

  // Check if the team is full before adding a new member
  if (team.members.length >= team.maxMembers) {
    throw new Error('Team is full, cannot accept request');
  }

  // Add the member to the members array and remove the request
  await updateDoc(teamRef, {
    members: arrayUnion(member),
    joinRequests: arrayRemove(member.id)
  });
};

// Reject a join request
export const rejectJoinRequest = async (teamId: string, userId: string): Promise<void> => {
  const teamRef = doc(db, 'teams', teamId);
  await updateDoc(teamRef, {
    joinRequests: arrayRemove(userId),
  });
};

// Get teams where a user has a pending join request
export const getTeamsWithJoinRequestFromUser = async (userId: string): Promise<Team[]> => {
  try {
    const teamsQuery = query(
      collection(db, 'teams'),
      where('joinRequests', 'array-contains', userId)
    );
    const teamsSnapshot = await getDocs(teamsQuery);
    return teamsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }) as Team);
  } catch (error) {
    console.error('Error getting teams with join requests for user:', error);
    throw error;
  }
};

// Helper function to get TeamMember data from a user object (e.g., from Firebase Auth)
export const getTeamMemberDataFromUser = (user: any): TeamMember => {
  // Assuming the user object has properties like uid, displayName, photoURL
  // You might need to adjust property names based on your user structure
  return {
    id: user.uid,
    name: user.displayName || 'Anonymous',
    role: 'Member', // Default role when joining via request/skill match
    skills: [], // Skills will likely be on the user's profile, not directly on the auth user object
    // Conditionally include avatar only if photoURL exists
    ...(user.photoURL ? { avatar: user.photoURL } : {}),
  };
}; 