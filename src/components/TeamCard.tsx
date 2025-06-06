import React, { useState, useEffect } from 'react';
import { Team, TeamMember } from '../utils/teamUtils';
import { useAuth } from '../contexts/AuthContext';
import { getUserProfileData, UserProfileData } from '../utils/firestoreUtils';

interface TeamCardProps {
  team: Team;
  onEdit?: () => void;
  onDelete?: () => void;
  onJoin?: () => void;
  onLeave?: () => void;
  onRemoveMember?: (memberId: string) => void;
  onAcceptRequest?: (memberId: string) => void;
  onRejectRequest?: (memberId: string) => void;
}

const TeamCard: React.FC<TeamCardProps> = ({
  team,
  onEdit,
  onDelete,
  onJoin,
  onLeave,
  onRemoveMember,
  onAcceptRequest,
  onRejectRequest,
}) => {
  const { currentUser } = useAuth();
  const [membersWithNames, setMembersWithNames] = useState<TeamMember[]>(team.members);
  const [requestingMembers, setRequestingMembers] = useState<(UserProfileData & { id: string })[]>([]);

  useEffect(() => {
    const fetchMemberNames = async () => {
      const updatedMembers = await Promise.all(team.members.map(async (member) => {
        // Only fetch if the current name is 'Anonymous' or seems like a placeholder
        if (member.name === 'Anonymous' || !member.name || member.name.includes('@')) {
          const profile = await getUserProfileData(member.id);
          if (profile && profile.name) {
            return { ...member, name: profile.name, avatar: profile.profilePicture };
          } else if (currentUser?.uid === member.id && currentUser.displayName) {
             return { ...member, name: currentUser.displayName, avatar: currentUser.photoURL || member.avatar };
          }
        }
        return member; // Return original member if name is fine or profile not found
      }));
      setMembersWithNames(updatedMembers);
    };

    fetchMemberNames();
  }, [team.members, currentUser]); // Re-run if team members change or currentUser changes

  useEffect(() => {
    const fetchRequestingMemberNames = async () => {
      if (!team.joinRequests || team.joinRequests.length === 0) {
        setRequestingMembers([]);
        return;
      }
      const profiles = await Promise.all(team.joinRequests.map(async (userId) => {
        const profile = await getUserProfileData(userId);
        return profile ? { ...profile, id: userId } : null;
      }));
      setRequestingMembers(profiles.filter(profile => profile !== null) as (UserProfileData & { id: string })[]);
    };

    fetchRequestingMemberNames();
  }, [team.joinRequests]); // Re-run when join requests change

  const isTeamLead = currentUser?.uid === team.createdBy;
  const isMember = membersWithNames.some(member => member.id === currentUser?.uid);
  const isFull = membersWithNames.length >= team.maxMembers;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{team.name}</h3>
            <p className="mt-1 text-sm text-gray-500">{team.description}</p>
            <div className="mt-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {team.hackathonName}
              </span>
            </div>
            {isTeamLead && team.teamCode && (
              <div className="mt-4 bg-indigo-50 p-3 rounded-md">
                <p className="text-sm font-medium text-indigo-800">Team Code: {team.teamCode}</p>
                <p className="text-xs text-indigo-600 mt-1">Share this code with others to join your team</p>
              </div>
            )}
          </div>
          {isTeamLead && (
            <div className="flex space-x-2">
              <button
                onClick={onEdit}
                className="text-indigo-600 hover:text-indigo-900"
              >
                Edit
              </button>
              <button
                onClick={onDelete}
                className="text-red-600 hover:text-red-900"
              >
                Delete
              </button>
            </div>
          )}
        </div>

        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-900">Required Skills</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {team.requiredSkills.map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-900">Members ({membersWithNames.length}/{team.maxMembers})</h3>
          <ul className="mt-2 space-y-2">
            {membersWithNames.map((member) => (
              <li key={member.id} className="flex items-center justify-between">
                <div className="flex items-center">
                  {member.avatar && (
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="h-6 w-6 rounded-full mr-2"
                    />
                  )}
                  <span className="text-sm text-gray-900">{member.name}</span>
                  <span className="ml-2 text-xs text-gray-500">({member.role})</span>
                </div>
                {isTeamLead && member.id !== currentUser?.uid && onRemoveMember && (
                  <button
                    onClick={() => onRemoveMember(member.id)}
                    className="text-red-600 hover:text-red-900 text-sm"
                  >
                    Remove
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>

        {isTeamLead && requestingMembers.length > 0 && (
          <div className="mt-6 border-t pt-4">
            <h3 className="text-sm font-medium text-gray-900">Join Requests ({requestingMembers.length})</h3>
            <ul className="mt-2 space-y-2">
              {requestingMembers.map((member) => (
                <li key={member.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    {member.profilePicture && (
                      <img
                        src={member.profilePicture}
                        alt={member.name}
                        className="h-6 w-6 rounded-full mr-2"
                      />
                    )}
                    <span className="text-sm font-medium text-gray-900">{member.name}</span>
                  </div>
                  <div className="flex space-x-2">
                    {onAcceptRequest && (
                      <button
                        onClick={() => onAcceptRequest(member.id)}
                        className="text-green-600 hover:text-green-900 text-sm"
                      >
                        Accept
                      </button>
                    )}
                    {onRejectRequest && (
                      <button
                        onClick={() => onRejectRequest(member.id)}
                        className="text-red-600 hover:text-red-900 text-sm"
                      >
                        Reject
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {!isTeamLead && (membersWithNames.length < team.maxMembers || isMember) && (
          <div className="mt-6">
            {isMember ? (
              <button
                onClick={onLeave}
                className="w-full rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 shadow-sm hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Leave Team
              </button>
            ) : (
              <button
                onClick={onJoin}
                disabled={isFull}
                className={`w-full rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  isFull
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
                }`}
              >
                {isFull ? 'Team is Full' : 'Join Team'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamCard; 