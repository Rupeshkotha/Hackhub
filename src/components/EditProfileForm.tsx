import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { saveUserProfile } from '../firestoreUtils'; // Import the save function
import { doc, getDoc } from "firebase/firestore"; // Import Firestore functions for fetching
import { db } from '../firebase'; // Import db

interface ProfileFormData {
  name: string;
  university: string;
  experience: string;
  skills: string;
  github: string; // Example link field
  linkedin: string; // Example link field
  // Add other fields as needed
}

interface UserProfileData {
  name?: string;
  university?: string;
  experience?: string;
  skills?: string[];
  links?: { name: string; url: string }[];
}

interface EditProfileFormProps {
  initialData: UserProfileData | null;
  onSave: (updatedData: UserProfileData) => void;
  onCancel: () => void;
}

const EditProfileForm: React.FC<EditProfileFormProps> = ({ initialData, onSave, onCancel }) => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    university: '',
    experience: '',
    skills: '', // Store as comma-separated string for the form
    github: '',
    linkedin: '',
    // Initialize other fields
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Populate form with initial data
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        university: initialData.university || '',
        experience: initialData.experience || '',
        skills: initialData.skills ? initialData.skills.join(', ') : '', // Convert array to string
        github: initialData.links?.find((link: { name: string; url: string }) => link.name === 'GitHub')?.url || '',
        linkedin: initialData.links?.find((link: { name: string; url: string }) => link.name === 'LinkedIn')?.url || '',
        // Set other fields
      });
    }
    setLoading(false); // Set loading to false after initial data is set
  }, [initialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return; // Should not happen if route is protected

    setSaving(true);
    setError(null);
    setSuccess(null);

    // Prepare data for Firestore, converting skills string to array and links to array of objects
    const profileDataToSave: UserProfileData = {
      name: formData.name,
      university: formData.university,
      experience: formData.experience,
      skills: formData.skills.split(',').map(skill => skill.trim()).filter(skill => skill !== ''),
      links: [
        formData.github ? { name: 'GitHub', url: formData.github } : null,
        formData.linkedin ? { name: 'LinkedIn', url: formData.linkedin } : null,
        // Add other links
      ].filter((link): link is { name: string; url: string } => link !== null),
      // Add other fields
    };

    try {
      await saveUserProfile(currentUser.uid, profileDataToSave);
      setSuccess('Profile saved successfully!');
      onSave(profileDataToSave); // Call the onSave callback with the new data
      // Optionally redirect or close form
    } catch (err: any) {
      setError('Failed to save profile: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Remove loading state based on fetch inside the form, as fetching is now in parent Profile component
  // if (loading) {
  //   return <div>Loading profile data...</div>; // Loading state
  // }

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            name="name"
            id="name"
            value={formData.name}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        {/* University */}
        <div>
          <label htmlFor="university" className="block text-sm font-medium text-gray-700">University</label>
          <input
            type="text"
            name="university"
            id="university"
            value={formData.university}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        {/* Experience */}
        <div>
          <label htmlFor="experience" className="block text-sm font-medium text-gray-700">Experience</label>
          <textarea
            name="experience"
            id="experience"
            rows={3}
            value={formData.experience}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          ></textarea>
        </div>

        {/* Skills (comma-separated) */}
        <div>
          <label htmlFor="skills" className="block text-sm font-medium text-gray-700">Skills (comma-separated)</label>
          <input
            type="text"
            name="skills"
            id="skills"
            value={formData.skills}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="e.g. React, Node.js, Figma"
          />
        </div>

        {/* Links (e.g., GitHub, LinkedIn) */}
        <div>
          <label htmlFor="github" className="block text-sm font-medium text-gray-700">GitHub Profile URL</label>
          <input
            type="text"
            name="github"
            id="github"
            value={formData.github}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="e.g. https://github.com/username"
          />
        </div>
        <div>
          <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700">LinkedIn Profile URL</label>
          <input
            type="text"
            name="linkedin"
            id="linkedin"
            value={formData.linkedin}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="e.g. https://www.linkedin.com/in/username"
          />
        </div>

        {/* Add other fields as needed */}

        {/* Submit and Cancel Buttons */}
        <div className="flex justify-end gap-4">
           <button
             type="button"
             onClick={onCancel}
             className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
           >
             Cancel
           </button>
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-red-600 text-center">{error}</p>}
        {success && <p className="mt-2 text-sm text-green-600 text-center">{success}</p>}
      </form>
    </div>
  );
};

export default EditProfileForm; 