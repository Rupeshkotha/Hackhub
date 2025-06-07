import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Team, TeamMember, createTeam, updateTeam, getTeam } from '../utils/teamUtils';
import { UserProfileData } from '../utils/firestoreUtils';

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
  });
  const [skillInput, setSkillInput] = useState('');
  const [skillSuggestions, setSkillSuggestions] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [teamCode, setTeamCode] = useState('');

  // Initialize form data when initialData changes
  useEffect(() => {
    if (initialData) {
      console.log('Initializing form with data:', initialData);
      setFormData({
        name: initialData.name,
        description: initialData.description,
        requiredSkills: initialData.requiredSkills || [],
        maxMembers: initialData.maxMembers,
        hackathonId: initialData.hackathonId,
        hackathonName: initialData.hackathonName,
      });
      setTeamCode(initialData.teamCode);
    }
  }, [initialData]);

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
    console.log('Adding skill:', skill);
    setFormData(prev => {
      const currentSkills = prev.requiredSkills || [];
      if (!currentSkills.includes(skill)) {
        const newSkills = [...currentSkills, skill];
        console.log('New skills array:', newSkills);
        return {
          ...prev,
          requiredSkills: newSkills,
        };
      }
      return prev;
    });
    setSkillInput('');
    setSkillSuggestions([]);
  };

  const removeSkill = (skillToRemove: string) => {
    console.log('Removing skill:', skillToRemove);
    setFormData(prev => {
      const currentSkills = prev.requiredSkills || [];
      const newSkills = currentSkills.filter(skill => skill !== skillToRemove);
      console.log('New skills array after removal:', newSkills);
      return {
        ...prev,
        requiredSkills: newSkills,
      };
    });
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

      console.log('Form data before submit:', formData);
      console.log('Initial data:', initialData);

      if (initialData) {
        // For updates, only send fields that have values
        const updates: Partial<Team> = {};
        
        if (formData.name) updates.name = formData.name;
        if (formData.description) updates.description = formData.description;
        if (formData.requiredSkills) {
          updates.requiredSkills = formData.requiredSkills;
        }
        if (formData.maxMembers) updates.maxMembers = formData.maxMembers;
        if (formData.hackathonId) updates.hackathonId = formData.hackathonId;
        if (formData.hackathonName) updates.hackathonName = formData.hackathonName;

        console.log('Updating team with:', updates);
        await updateTeam(initialData.id, updates);
        const updatedTeam = await getTeam(initialData.id);
        console.log('Team after update:', updatedTeam);
        
        if (updatedTeam) {
          onSubmit(updatedTeam);
        } else {
          throw new Error('Failed to fetch updated team');
        }
      } else {
        // For new teams, ensure all required fields are set
        const newTeamData = {
          name: formData.name || '',
          description: formData.description || '',
          requiredSkills: Array.isArray(formData.requiredSkills) ? formData.requiredSkills : [],
          maxMembers: typeof formData.maxMembers === 'number' ? formData.maxMembers : 4,
          hackathonId: formData.hackathonId,
          hackathonName: formData.hackathonName,
          members: [{
            id: currentUser.uid,
            name: currentUser.displayName || 'Anonymous',
            role: 'Team Lead',
            skills: [],
            ...(currentUser.photoURL ? { avatar: currentUser.photoURL } : {})
          }],
          createdAt: new Date(),
          createdBy: currentUser.uid,
          joinRequests: []
        };

        console.log('Creating new team with data:', newTeamData);
        const teamId = await createTeam(newTeamData);
        const newTeam = await getTeam(teamId);
        if (newTeam) {
          setTeamCode(newTeam.teamCode);
          onSubmit(newTeam);
        } else {
          throw new Error('Failed to fetch new team');
        }
      }
    } catch (err) {
      console.error('Error updating team:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
          {error}
        </div>
      )}

      {teamCode && (
        <div className="bg-green-50 p-4 rounded-md">
          <p className="text-sm font-medium text-green-800">Team Code: {teamCode}</p>
          <p className="text-xs text-green-600 mt-1">Share this code with others to join your team</p>
        </div>
      )}

      <div>
        <label htmlFor="hackathon" className="block text-sm font-medium text-gray-700">
          Hackathon
        </label>
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
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        >
          <option value="">Select a hackathon</option>
          {hackathons.map(hackathon => (
            <option key={hackathon.id} value={hackathon.id}>
              {hackathon.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Team Name
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        />
      </div>

      <div>
        <label htmlFor="maxMembers" className="block text-sm font-medium text-gray-700">
          Maximum Team Size
        </label>
        <input
          type="number"
          id="maxMembers"
          min="2"
          max="10"
          value={formData.maxMembers}
          onChange={(e) => setFormData(prev => ({ ...prev, maxMembers: parseInt(e.target.value) }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        />
      </div>

      <div>
        <label htmlFor="skills" className="block text-sm font-medium text-gray-700">
          Required Skills
        </label>
        <div className="mt-1">
          <input
            type="text"
            id="skills"
            value={skillInput}
            onChange={handleSkillInputChange}
            placeholder="Type to add skills..."
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          {skillSuggestions.length > 0 && (
            <div className="mt-1 max-h-48 overflow-y-auto rounded-md border border-gray-300 bg-white shadow-sm">
              {skillSuggestions.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => handleSkillSuggestionClick(skill)}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 focus:outline-none"
                >
                  {skill}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {formData.requiredSkills?.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-0.5 text-sm font-medium text-indigo-800"
            >
              {skill}
              <button
                type="button"
                onClick={() => removeSkill(skill)}
                className="ml-1 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500 focus:outline-none"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          {loading ? 'Saving...' : initialData ? 'Update Team' : 'Create Team'}
        </button>
      </div>
    </form>
  );
};

export default TeamForm; 