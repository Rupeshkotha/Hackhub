import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Team, getUserTeams, getAvailableTeams, deleteTeam, addTeamMember, removeTeamMember, getTeamByCode, TeamMember, getTeam, addJoinRequest, acceptJoinRequest, rejectJoinRequest } from '../utils/teamUtils';
import TeamForm from '../components/TeamForm';
import TeamCard from '../components/TeamCard';
import { getUserProfileData } from '../utils/firestoreUtils';
import SkillMatch from '../components/SkillMatch';

const Teams: React.FC = () => {
  const { currentUser } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [teamCode, setTeamCode] = useState('');
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [showSkillMatch, setShowSkillMatch] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  useEffect(() => {
    loadTeams();
  }, [currentUser]);

  const loadTeams = async () => {
    if (!currentUser) {
      setTeams([]); // Clear teams if no user is logged in
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const userTeams = await getUserTeams(currentUser.uid);
      const availableTeams = await getAvailableTeams();

      // Combine user teams and available teams, ensuring user teams are prioritized
      const userTeamIds = new Set(userTeams.map(team => team.id));
      let combinedTeams: Team[] = [...userTeams];

      availableTeams.forEach(team => {
        if (!userTeamIds.has(team.id)) {
          combinedTeams.push(team);
        }
      });

      // Sort teams: user teams first, then available teams (optional, but keeps it consistent)
       combinedTeams.sort((a, b) => {
           const aIsUserTeam = userTeamIds.has(a.id);
           const bIsUserTeam = userTeamIds.has(b.id);
           if (aIsUserTeam && !bIsUserTeam) return -1;
           if (!aIsUserTeam && bIsUserTeam) return 1;
           return 0; // Maintain original order for teams within the same category
       });


      // Fetch user profiles for all members in fetched teams to get names and avatars
      const allMembersIds = new Set<string>();
      combinedTeams.forEach(team => {
        team.members.forEach(member => allMembersIds.add(member.id));
      });

      const memberProfiles: { [key: string]: { name: string, avatar?: string } } = {};
      // Filter out current user ID from fetching if we can use currentUser.displayName
      const memberIdsToFetch = Array.from(allMembersIds).filter(id => id !== currentUser.uid || !currentUser.displayName);

      for (const memberId of memberIdsToFetch) {
          // Avoid fetching if we already have the user's display name and it's not generic Anonymous
           if (memberId === currentUser.uid && currentUser.displayName && currentUser.displayName !== 'Anonymous') {
               memberProfiles[memberId] = { name: currentUser.displayName, avatar: currentUser.photoURL || undefined };
               continue;
           }
        const profile = await getUserProfileData(memberId);
        if (profile) {
          memberProfiles[memberId] = { name: profile.name, avatar: profile.profilePicture };
        }
      }


      // Update team members with names and avatars from profiles or currentUser
      const teamsWithProfileNames = combinedTeams.map(team => ({
        ...team,
        members: team.members.map(member => {
            // Prioritize profile name, then currentUser.displayName, then existing member name, finally Anonymous
            const name = memberProfiles[member.id]?.name || (member.id === currentUser.uid ? currentUser.displayName : null) || member.name || 'Anonymous';
            const avatar = memberProfiles[member.id]?.avatar || (member.id === currentUser.uid ? currentUser.photoURL : null) || member.avatar;

            return {
                ...member,
                name: name,
                avatar: avatar,
            };
        }),
      }));

      setTeams(teamsWithProfileNames);
    } catch (err) {
      setError('Failed to load teams');
      console.error(err);
      setTeams([]); // Clear teams on error
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = (team: Team) => {
    // Just close the modal and reload teams. loadTeams will fetch the newly created team.
    setShowCreateModal(false);
    loadTeams();
  };

  const handleEditTeam = async (team: Team) => {
    try {
      // Close the modal
      setEditingTeam(null);
      
      // Fetch the latest team data
      const updatedTeam = await getTeam(team.id);
      if (!updatedTeam) {
        throw new Error('Failed to fetch updated team');
      }

      // Update the teams list with the new data
      setTeams(prevTeams => {
        const index = prevTeams.findIndex(t => t.id === updatedTeam.id);
        if (index !== -1) {
          const newTeams = [...prevTeams];
          newTeams[index] = updatedTeam;
          return newTeams;
        }
        return prevTeams;
      });
    } catch (err) {
      console.error('Error updating team:', err);
      setError('Failed to update team');
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    try {
      await deleteTeam(teamId);
      // After deleting, reload the teams
      loadTeams();
    } catch (err) {
      setError('Failed to delete team');
      console.error(err);
    }
  };

  // New function for direct joining (via code)
  const handleDirectJoinTeam = async (team: Team) => {
    if (!currentUser) {
        setError('You must be logged in to join a team.');
        return;
    }
    setError('');
    try {
      if (team.members.some(member => member.id === currentUser.uid)) {
         setError('You are already a member of this team.');
         return;
      }

      if (team.members.length >= team.maxMembers) {
           setError('Team is full.');
           return;
      }

      const newMember: TeamMember = {
        id: currentUser.uid,
        name: currentUser.displayName || 'Anonymous',
        role: 'Member',
        skills: [],
        avatar: currentUser.photoURL || undefined
      };

      await addTeamMember(team.id, newMember);
      await loadTeams(); // Reload after successful join

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join team');
      console.error(err);
    }
  };

  // Modified function for requesting to join (via button on card)
  const handleRequestToJoinTeam = async (team: Team) => {
    if (!currentUser) {
        setError('You must be logged in to request to join a team.');
        return;
    }
    setError('');
    try {
      // Check if already a member or already requested
      if (team.members.some(member => member.id === currentUser.uid)) {
         setError('You are already a member of this team.');
         return;
      }
      if (team.joinRequests && team.joinRequests.includes(currentUser.uid)) {
         setError('You have already requested to join this team.');
         return;
      }

      await addJoinRequest(team.id, currentUser.uid);

      // Explicitly fetch the updated team document
      const updatedTeam = await getTeam(team.id);

      if(updatedTeam) {
        // Find the index of the team in the current state and replace it
        setTeams(prevTeams => {
          const index = prevTeams.findIndex(t => t.id === updatedTeam.id);
          if (index !== -1) {
            const newTeams = [...prevTeams];
            newTeams[index] = updatedTeam;
            return newTeams;
          } else {
            // If somehow the team isn't in the list (shouldn't happen if lead), add it
            return [...prevTeams, updatedTeam];
          }
        });
      } else {
        // If fetching the updated team fails, fall back to a full reload or handle error
        console.warn('Failed to fetch updated team after join request, reloading all teams.');
        await loadTeams();
      }

      // Optionally, show a success message
      alert('Request to join sent!');


    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send join request');
      console.error(err);
    }
  };

  const handleLeaveTeam = async (team: Team) => {
    if (!currentUser) {
         setError('You must be logged in to leave a team.');
         return;
    }
     // Clear any previous errors when starting a leave action
    setError('');
    try {
      await removeTeamMember(team.id, currentUser.uid);

      // After leaving, reload teams
      await loadTeams();
    } catch (err) {
      setError('Failed to leave team');
      console.error(err);
    }
  };

  // Handle accepting a join request
  const handleAcceptRequest = async (teamId: string, memberId: string) => {
    if (!currentUser) {
      setError('You must be logged in to accept a join request.');
      return;
    }
    setError('');
    try {
      // Fetch the user's profile data to create a proper TeamMember object
      const userProfile = await getUserProfileData(memberId);

      if (!userProfile) {
        setError('Could not fetch user profile data for the requested member.');
        return;
      }

      // Create the TeamMember object from the profile data, excluding undefined fields
      const memberToAdd: TeamMember = {
        id: memberId,
        name: userProfile.name || 'Anonymous',
        role: 'Member', // Default role for accepted member
        skills: userProfile.technicalSkills?.map(skill => skill.name) || [],
        // Conditionally include avatar only if profilePicture exists and is not undefined
        ...(userProfile.profilePicture !== undefined ? { avatar: userProfile.profilePicture } : {}),
      } as TeamMember;

      await acceptJoinRequest(teamId, memberToAdd);
      await loadTeams(); // Reload teams to update UI
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept join request');
      console.error(err);
    }
  };

  // Handle rejecting a join request
  const handleRejectRequest = async (teamId: string, memberId: string) => {
    if (!currentUser) {
      setError('You must be logged in to reject a join request.');
      return;
    }
    setError('');
    try {
      await rejectJoinRequest(teamId, memberId);
      await loadTeams(); // Reload teams to update UI
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject join request');
      console.error(err);
    }
  };

  const handleRemoveMember = async (teamId: string, memberId: string) => {
    if (!currentUser) {
      setError('You must be logged in to remove a member.');
      return;
    }
    setError('');
    try {
      await removeTeamMember(teamId, memberId);
      await loadTeams();
    } catch (err) {
      setError('Failed to remove member');
      console.error(err);
    }
  };

  const handleJoinByCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!teamCode.trim()) {
        setError('Please enter a team code.');
        return;
    }

    try {
      const team = await getTeamByCode(teamCode.trim());
      if (!team) {
        setError('Invalid team code.');
        return;
      }

      // Call the new direct join function
      await handleDirectJoinTeam(team); // This includes checks for membership and fullness

      // Only close modal and clear code if handleDirectJoinTeam was successful and didn't set an error
      // We can check the error state after the async call, or rely on loadTeams triggering re-render
      // For simplicity, let's just close if no immediate error was set by handleDirectJoinTeam
      // A more robust approach might check for success state from handleDirectJoinTeam
       if (!error) {
         setShowJoinModal(false);
         setTeamCode('');
       }

    } catch (err) {
      // handleDirectJoinTeam already sets error if it fails, no need to set it here again
      console.error(err);
    }
  };

  const handleSkillMatch = (team: Team) => {
    setSelectedTeam(team);
    setShowSkillMatch(true);
  };

  const handleMatch = async (userId: string) => {
    if (!selectedTeam) return;
    try {
      // Send a join request to the matched user
      await addJoinRequest(selectedTeam.id, userId);
      alert(`Join request sent to user ${userId}!`);
    } catch (err) {
      setError('Failed to send match request');
      console.error(err);
      alert('Failed to send join request.');
    }
  };

  const handleSkip = () => {
    // Just move to the next potential member
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Teams</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your teams and join others</p>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => {setShowJoinModal(true); setError('');}} // Clear previous errors on opening
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Join Team
          </button>
          <button
            onClick={() => {setShowCreateModal(true); setError('');}} // Clear previous errors on opening
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Create Team
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 text-red-500 p-4 rounded-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {teams.length === 0 && !loading && !error && (
          <div className="col-span-full text-center text-gray-500">
            No teams found. Create one or join an existing team!
          </div>
        )}
        {teams.map((team) => (
          <TeamCard
            key={team.id}
            team={team}
            onEdit={() => setEditingTeam(team)}
            onDelete={() => handleDeleteTeam(team.id)}
            onJoin={() => handleRequestToJoinTeam(team)}
            onLeave={() => handleLeaveTeam(team)}
            onRemoveMember={(memberId) => handleRemoveMember(team.id, memberId)}
            onAcceptRequest={(memberId) => handleAcceptRequest(team.id, memberId)}
            onRejectRequest={(memberId) => handleRejectRequest(team.id, memberId)}
            onSkillMatch={() => handleSkillMatch(team)}
          />
        ))}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50"> {/* Added z-index */}
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"> {/* Added max height and overflow */}
            <h2 className="text-xl font-semibold mb-4">Create New Team</h2>
            <TeamForm
              onSubmit={handleCreateTeam}
              onCancel={() => setShowCreateModal(false)}
            />
          </div>
        </div>
      )}

      {showJoinModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50"> {/* Added z-index */}
          <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto"> {/* Added max height and overflow */}
            <h2 className="text-xl font-semibold mb-4">Join Team</h2>
            <form onSubmit={handleJoinByCode} className="space-y-4">
              <div>
                <label htmlFor="teamCode" className="block text-sm font-medium text-gray-700">
                  Team Code
                </label>
                <input
                  type="text"
                  id="teamCode"
                  value={teamCode}
                  onChange={(e) => setTeamCode(e.target.value)}
                  placeholder="Enter team code"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>
              {error && ( // Display error within the modal if join by code fails
                  <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
                    {error}
                  </div>
                )}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowJoinModal(false);
                    setTeamCode('');
                    setError(''); // Clear error on modal close
                  }}
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Join Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingTeam && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50"> {/* Added z-index */}
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"> {/* Added max height and overflow */}
            <h2 className="text-xl font-semibold mb-4">Edit Team</h2>
            <TeamForm
              initialData={editingTeam}
              onSubmit={handleEditTeam}
              onCancel={() => setEditingTeam(null)}
            />
          </div>
        </div>
      )}

      {showSkillMatch && selectedTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Find Team Members</h2>
              <button
                onClick={() => setShowSkillMatch(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <SkillMatch
              team={selectedTeam}
              onMatch={handleMatch}
              onSkip={handleSkip}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Teams; 