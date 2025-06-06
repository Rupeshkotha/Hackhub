import React, { useState, useEffect } from 'react';
import { Team, TeamMember } from '../utils/teamUtils';
import { useAuth } from '../contexts/AuthContext';
import { getUserProfileData, UserProfileData } from '../utils/firestoreUtils';
import { 
  UserGroupIcon, 
  CodeBracketIcon, 
  PencilSquareIcon, 
  TrashIcon, 
  UserPlusIcon, 
  ArrowRightOnRectangleIcon,
  XMarkIcon,
  CheckIcon,
  ClockIcon,
  TrophyIcon,
  ChevronDownIcon,
  UserIcon
} from '@heroicons/react/24/outline';

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
  const [showMembers, setShowMembers] = useState(false);

  useEffect(() => {
    const fetchMemberNames = async () => {
      const updatedMembers = await Promise.all(team.members.map(async (member) => {
        if (member.name === 'Anonymous' || !member.name || member.name.includes('@')) {
          const profile = await getUserProfileData(member.id);
          if (profile && profile.name) {
            return { ...member, name: profile.name, avatar: profile.profilePicture };
          } else if (currentUser?.uid === member.id && currentUser.displayName) {
            return { ...member, name: currentUser.displayName, avatar: currentUser.photoURL || member.avatar };
          }
        }
        return member;
      }));
      setMembersWithNames(updatedMembers);
    };

    fetchMemberNames();
  }, [team.members, currentUser]);

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
  }, [team.joinRequests]);

  const isTeamLead = currentUser?.uid === team.createdBy;
  const isMember = membersWithNames.some(member => member.id === currentUser?.uid);
  const isFull = membersWithNames.length >= team.maxMembers;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow duration-300">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <h3 className="text-xl font-bold text-gray-900">{team.name}</h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                {team.hackathonName}
              </span>
            </div>
            <p className="mt-2 text-gray-600 line-clamp-2">{team.description}</p>
            
            <div className="mt-4 flex flex-wrap gap-2">
              {team.requiredSkills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                >
                  <CodeBracketIcon className="h-3 w-3 mr-1" />
                  {skill}
                </span>
              ))}
            </div>

            <div className="mt-4 flex items-center text-sm text-gray-500">
              <UserGroupIcon className="h-5 w-5 mr-1.5" />
              <span>{membersWithNames.length} / {team.maxMembers} members</span>
            </div>

            {isTeamLead && team.teamCode && (
              <div className="mt-4 bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg border border-indigo-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-indigo-800">Team Code</p>
                    <p className="text-2xl font-mono font-bold text-indigo-600 mt-1">{team.teamCode}</p>
                  </div>
                  <TrophyIcon className="h-8 w-8 text-indigo-400" />
                </div>
                <p className="text-xs text-indigo-600 mt-2">Share this code with others to join your team</p>
              </div>
            )}
          </div>

          {isTeamLead && (
            <div className="flex space-x-2 ml-4">
              <button
                onClick={onEdit}
                className="p-2 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-lg transition-colors duration-200"
                title="Edit Team"
              >
                <PencilSquareIcon className="h-5 w-5" />
              </button>
              <button
                onClick={onDelete}
                className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors duration-200"
                title="Delete Team"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={() => setShowMembers(!showMembers)}
            className="w-full flex items-center justify-between text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors duration-200"
          >
            <span>Team Members</span>
         <ChevronDownIcon
  className={`h-5 w-5 transform transition-transform duration-200 ${
    showMembers ? 'rotate-180' : ''
  }`}
/>

          </button>

          {showMembers && (
            <div className="mt-4 space-y-3">
              {membersWithNames.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {member.avatar ? (
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="h-8 w-8 rounded-full"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                        <UserIcon className="h-5 w-5 text-indigo-600" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">{member.name}</p>
                      <p className="text-xs text-gray-500">{member.role}</p>
                    </div>
                  </div>
                  {isTeamLead && member.id !== currentUser?.uid && (
                    <button
                      onClick={() => onRemoveMember?.(member.id)}
                      className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      title="Remove Member"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {requestingMembers.length > 0 && isTeamLead && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Join Requests</h4>
              <div className="space-y-3">
                {requestingMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      {member.profilePicture ? (
                        <img
                          src={member.profilePicture}
                          alt={member.name}
                          className="h-8 w-8 rounded-full"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                          <UserIcon className="h-5 w-5 text-yellow-600" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">{member.name}</p>
                        <p className="text-xs text-gray-500">Requesting to join</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onAcceptRequest?.(member.id)}
                        className="p-1 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-lg transition-colors duration-200"
                        title="Accept Request"
                      >
                        <CheckIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => onRejectRequest?.(member.id)}
                        className="p-1 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        title="Reject Request"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end">
            {!isMember && !isFull && (
              <button
                onClick={onJoin}
                className="inline-flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-700 text-sm font-medium text-white hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
              >
                <UserPlusIcon className="h-5 w-5 mr-2" />
                Join Team
              </button>
            )}
            {isMember && !isTeamLead && (
              <button
                onClick={onLeave}
                className="inline-flex items-center px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                Leave Team
              </button>
            )}
            {isFull && !isMember && (
              <div className="inline-flex items-center px-4 py-2 rounded-lg bg-gray-100 text-sm font-medium text-gray-500">
                <ClockIcon className="h-5 w-5 mr-2" />
                Team is Full
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamCard;