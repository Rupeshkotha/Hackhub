import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Team, TeamMember, createTeam, updateTeam, getTeam } from '../utils/teamUtils';
import { UserProfileData, getUserProfileData } from '../utils/firestoreUtils';
import { PlusIcon, XMarkIcon, ChevronDownIcon, UserGroupIcon, DocumentTextIcon, CodeBracketIcon, UserIcon } from '@heroicons/react/24/outline';

interface TeamFormProps {
  initialData?: Team;
  onSubmit: (team: Team) => void;
  onCancel: () => void;
}

const TeamForm: React.FC<TeamFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState<Partial<Team>>({
    name: '',
    description: '',
    requiredSkills: [],
    maxMembers: 4,
    hackathonId: '',
    hackathonName: '',
    ...initialData,
  });
  const [skillInput, setSkillInput] = useState('');
  const [skillSuggestions, setSkillSuggestions] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [teamCode, setTeamCode] = useState(initialData?.teamCode || '');

  // Common skills for suggestions
  const commonSkills = [
    'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'C++',
    'HTML', 'CSS', 'SQL', 'MongoDB', 'AWS', 'Docker', 'Kubernetes', 'Git',
    'UI/UX Design', 'Machine Learning', 'Data Science', 'DevOps', 'Mobile Development'
  ];

  // Mock hackathons - replace with actual data from your backend
  const hackathons = [
    { id: 'hack1', name: 'Hackathon 2024' },
    { id: 'hack2', name: 'CodeFest 2024' },
    { id: 'hack3', name: 'InnovateX 2024' },
  ];

  useEffect(() => {
    if (skillInput) {
      const filtered = commonSkills.filter(skill =>
        skill.toLowerCase().includes(skillInput.toLowerCase())
      );
      setSkillSuggestions(filtered);
    } else {
      setSkillSuggestions([]);
    }
  }, [skillInput]);

  const handleSkillInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSkillInput(e.target.value);
  };

  const handleSkillSuggestionClick = (skill: string) => {
    if (!formData.requiredSkills?.includes(skill)) {
      setFormData(prev => ({
        ...prev,
        requiredSkills: [...(prev.requiredSkills || []), skill],
      }));
    }
    setSkillInput('');
    setSkillSuggestions([]);
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      requiredSkills: prev.requiredSkills?.filter(skill => skill !== skillToRemove),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!currentUser) throw new Error('You must be logged in to create a team');
      if (!formData.hackathonId || !formData.hackathonName) {
        throw new Error('Please select a hackathon');
      }

      // Get the current user's profile data
      const userProfile = await getUserProfileData(currentUser.uid);
      const userName = userProfile?.name || currentUser.displayName || 'Anonymous';

      // Create the update data with only the fields that have changed
      const updateData: Omit<Team, 'id' | 'teamCode'> = {
        name: formData.name || '',
        description: formData.description || '',
        requiredSkills: formData.requiredSkills || [],
        maxMembers: formData.maxMembers || 4,
        hackathonId: formData.hackathonId,
        hackathonName: formData.hackathonName,
        members: initialData?.members || [{
          id: currentUser.uid,
          name: userName,
          role: 'Team Lead',
          skills: userProfile?.technicalSkills?.map(skill => skill.name) || [],
          avatar: userProfile?.profilePicture || currentUser.photoURL || undefined
        }],
        createdAt: initialData?.createdAt || new Date(),
        createdBy: currentUser.uid,
      };

      if (initialData) {
        // For updates, only send the fields that have changed
        const changedFields = Object.entries(updateData).reduce((acc, [key, value]) => {
          if (value !== initialData[key as keyof Team]) {
            acc[key] = value;
          }
          return acc;
        }, {} as Record<string, any>);

        await updateTeam(initialData.id, changedFields);
        
        // Create the complete updated team object for the UI
        const updatedTeam: Team = {
          ...initialData,
          ...changedFields
        };
        
        onSubmit(updatedTeam);
      } else {
        const teamId = await createTeam(updateData);
        const newTeam = await getTeam(teamId);
        if (newTeam) {
          setTeamCode(newTeam.teamCode);
          onSubmit(newTeam);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg flex items-center">
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {error}
        </div>
      )}

      {teamCode && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-4 rounded-lg">
          <p className="text-sm font-medium text-green-800">Team Code: {teamCode}</p>
          <p className="text-xs text-green-600 mt-1">Share this code with others to join your team</p>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label htmlFor="hackathon" className="block text-sm font-medium text-gray-700 mb-2">
            Select Hackathon
          </label>
          <div className="relative">
            <select
              id="hackathon"
              value={formData.hackathonId}
              onChange={(e) => {
                const hackathon = hackathons.find(h => h.id === e.target.value);
                setFormData(prev => ({
                  ...prev,
                  hackathonId: hackathon?.id || '',
                  hackathonName: hackathon?.name || '',
                }));
              }}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white pl-4 pr-10 py-3 appearance-none"
              required
            >
              <option value="">Choose a hackathon...</option>
              {hackathons.map(hackathon => (
                <option key={hackathon.id} value={hackathon.id}>
                  {hackathon.name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <ChevronDownIcon className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Team Name
          </label>
          <div className="relative">
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white pl-4 pr-4 py-3"
              placeholder="e.g., Code Warriors, Hack Heroes"
              required
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <UserGroupIcon className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Team Description
          </label>
          <div className="relative">
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white pl-4 pr-4 py-3 resize-none"
              placeholder="Describe your team's goals, vision, and what you're looking to build..."
              required
            />
            <div className="absolute top-3 right-3 pointer-events-none">
              <DocumentTextIcon className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="maxMembers" className="block text-sm font-medium text-gray-700 mb-2">
            Team Size
          </label>
          <div className="relative">
            <input
              type="number"
              id="maxMembers"
              min="2"
              max="10"
              value={formData.maxMembers}
              onChange={(e) => setFormData(prev => ({ ...prev, maxMembers: parseInt(e.target.value) }))}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white pl-4 pr-12 py-3"
              required
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <UserIcon className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Choose between 2-10 team members
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Required Skills
          </label>
          <div className="relative">
            <input
              type="text"
              value={skillInput}
              onChange={handleSkillInputChange}
              placeholder="Type to add skills (e.g., React, Python, UI/UX)"
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white pl-4 pr-12 py-3"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <CodeBracketIcon className="h-5 w-5 text-gray-400" />
            </div>
            {skillSuggestions.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-lg border border-gray-200 max-h-60 overflow-auto">
                {skillSuggestions.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => handleSkillSuggestionClick(skill)}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center"
                  >
                    <CodeBracketIcon className="h-4 w-4 mr-2 text-gray-400" />
                    {skill}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {formData.requiredSkills?.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
              >
                <CodeBracketIcon className="h-4 w-4 mr-1.5 text-indigo-500" />
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="ml-2 inline-flex items-center p-0.5 rounded-full text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500 focus:outline-none"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-700 text-sm font-medium text-white hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Saving...
            </span>
          ) : (
            initialData ? 'Update Team' : 'Create Team'
          )}
        </button>
      </div>
    </form>
  );
};

export default TeamForm;