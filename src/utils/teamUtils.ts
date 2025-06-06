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
  const teamRef = doc(collection(db, 'teams'));
  const teamCode = generateTeamCode();
  const teamWithId = {
    ...teamData,
    id: teamRef.id,
    teamCode,
  };
  await setDoc(teamRef, teamWithId);
  return teamRef.id;
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
  const teamRef = doc(db, 'teams', teamId);
  await updateDoc(teamRef, updates);
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