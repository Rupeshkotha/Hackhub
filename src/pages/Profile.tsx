import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { saveUserProfile, UserProfileData } from '../utils/firestoreUtils';
import EditProfileForm from '../components/EditProfileForm';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import {
  UserCircleIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  CodeBracketIcon,
  LinkIcon,
  PencilIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

// Common skills list for suggestions
const commonSkills = [
  // Programming Languages
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'Ruby', 'PHP',
  'Swift', 'Kotlin', 'R', 'Scala', 'Perl', 'Haskell', 'MATLAB', 'Dart', 'Objective-C',

  // Web Development (Frontend)
  'HTML', 'CSS', 'SASS', 'LESS', 'Tailwind CSS', 'Bootstrap',
  'React', 'Angular', 'Vue.js', 'Svelte', 'Next.js', 'Nuxt.js',

  // Web Development (Backend)
  'Node.js', 'Express.js', 'Django', 'Flask', 'FastAPI', 'Spring Boot',
  'ASP.NET', 'Laravel', 'Ruby on Rails', 'NestJS', 'Hapi.js',

  // Mobile Development
  'React Native', 'Flutter', 'SwiftUI', 'Jetpack Compose', 'Ionic',

  // Databases
  'MongoDB', 'PostgreSQL', 'MySQL', 'SQLite', 'Firebase',
  'Redis', 'Cassandra', 'Oracle DB', 'MariaDB', 'DynamoDB', 'Elasticsearch',

  // Cloud & DevOps
  'AWS', 'Azure', 'Google Cloud Platform', 'Heroku', 'Netlify', 'Vercel',
  'Docker', 'Kubernetes', 'Terraform', 'Ansible', 'Jenkins', 'GitHub Actions',
  'CI/CD', 'DevOps', 'Serverless', 'OpenShift',

  // Version Control & Collaboration
  'Git', 'GitHub', 'GitLab', 'Bitbucket', 'SVN',

  // AI / Machine Learning / Deep Learning
  'Machine Learning', 'Deep Learning', 'AI', 'Data Science',
  'Computer Vision', 'NLP', 'Speech Recognition', 'Reinforcement Learning',
  'TensorFlow', 'PyTorch', 'Keras', 'Scikit-learn', 'OpenCV',
  'Transformers', 'Hugging Face', 'spaCy', 'NLTK', 'XGBoost', 'LightGBM',

  // Data Engineering & Big Data
  'Pandas', 'NumPy', 'Dask', 'Apache Spark', 'Apache Kafka',
  'Hadoop', 'Airflow', 'ETL', 'Data Warehousing', 'Data Lake',

  // Software Development Methodologies
  'Agile', 'Scrum', 'Kanban', 'TDD', 'BDD', 'Waterfall',

  // Software Engineering & Tools
  'Design Patterns', 'System Design', 'OOP', 'Functional Programming',
  'UML', 'UML Diagrams', 'Refactoring', 'Debugging', 'Unit Testing',
  'Integration Testing', 'JIRA', 'Confluence', 'Visual Studio Code', 'Eclipse', 'IntelliJ IDEA'
];

interface Skill {
  name: string;
  category: 'frontend' | 'backend' | 'ml' | 'design' | 'devops' | 'other';
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

interface Experience {
  id: string;
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
  technologies: string[];
  type: 'work' | 'internship' | 'hackathon' | 'project';
}

interface Education {
  id: string;
  institution: string;
  degree: string;
  major: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  relevantCoursework: string[];
}

interface Project {
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

const Profile: React.FC = () => {
  const { currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<UserProfileData>({
    name: '',
    title: '',
    bio: '',
    location: '',
    timezone: '',
    email: currentUser?.email || '',
    phone: '',
    profilePicture: '',
    technicalSkills: [],
    softSkills: [],
    languages: [],
    tools: [],
    experiences: [],
    education: [],
    projects: [],
    links: {},
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [skillSuggestions, setSkillSuggestions] = useState<string[]>([]);
  const [activeSkillIndex, setActiveSkillIndex] = useState<number>(-1);
  const [skillInputs, setSkillInputs] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    const loadProfileData = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const data = userDoc.data() as UserProfileData;
          setProfileData(data);
        }
      } catch (err: any) {
        console.error('Error loading profile:', err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, [currentUser]);

  const handleSave = async (data: UserProfileData) => {
    try {
      await saveUserProfile(currentUser!.uid, data);
      setProfileData(data);
      setIsEditing(false);
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setError('Failed to save profile');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData((prev: UserProfileData) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser) {
      await handleSave(profileData);
    }
  };

  const handleSkillInputChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    setSkillInputs(prev => ({ ...prev, [index]: value }));

    // Filter suggestions based on input
    if (value.trim()) {
      const filtered = commonSkills.filter(skill => 
        skill.toLowerCase().includes(value.toLowerCase()) &&
        !profileData.technicalSkills.some(s => s.name.toLowerCase() === skill.toLowerCase())
      );
      setSkillSuggestions(filtered.slice(0, 5));
      setActiveSkillIndex(index);
    } else {
      setSkillSuggestions([]);
      setActiveSkillIndex(-1);
    }
  };

  const handleSkillSuggestionClick = (suggestion: string) => {
    if (activeSkillIndex !== -1) {
      const newSkills = [...profileData.technicalSkills];
      newSkills[activeSkillIndex] = {
        name: suggestion,
        category: newSkills[activeSkillIndex].category,
        proficiency: newSkills[activeSkillIndex].proficiency
      };
      setProfileData((prev: UserProfileData) => ({ ...prev, technicalSkills: newSkills }));
      setSkillInputs(prev => ({ ...prev, [activeSkillIndex]: suggestion }));
      setSkillSuggestions([]);
      setActiveSkillIndex(-1);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Edit Profile</h2>
              <button
                onClick={() => setIsEditing(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <EditProfileForm
                initialData={profileData}
                onSave={(updatedData) => {
                  setProfileData(updatedData);
                  setIsEditing(false);
                }}
                onCancel={() => setIsEditing(false)}
              />
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-8">
          <div className="relative h-32 bg-gradient-to-r from-blue-500 to-purple-600">
            <div className="absolute -bottom-16 left-8">
              <div className="h-32 w-32 rounded-full border-4 border-white bg-white overflow-hidden">
                {profileData.profilePicture ? (
                  <img src={profileData.profilePicture} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <UserCircleIcon className="h-full w-full text-gray-300" />
                )}
              </div>
            </div>
          </div>
          <div className="pt-20 pb-8 px-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {profileData.name || 'Your Name'}
                </h1>
                <p className="mt-1 text-gray-500">{profileData.title || 'Add your title'}</p>
                <p className="text-gray-500">{profileData.location || 'Add your location'}</p>
                <p className="text-gray-500">{profileData.timezone || 'Add your timezone'}</p>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="md:col-span-2 space-y-8">
            {/* Bio */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center mb-4">
                <UserCircleIcon className="h-6 w-6 text-blue-500 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">About</h2>
              </div>
              {isEditing ? (
                <textarea
                  name="bio"
                  value={profileData.bio}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tell us about yourself"
                />
              ) : (
                <p className="text-gray-600 whitespace-pre-wrap">
                  {profileData.bio || 'Add your bio'}
                </p>
              )}
            </div>

            {/* Skills */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center mb-4">
                <CodeBracketIcon className="h-6 w-6 text-blue-500 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Technical Skills</h2>
              </div>
              {isEditing ? (
                <div className="space-y-4">
                  {profileData.technicalSkills.map((skill: Skill, index: number) => (
                    <div key={index} className="relative">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 relative">
                          <input
                            type="text"
                            value={skillInputs[index] || skill.name}
                            onChange={(e) => handleSkillInputChange(e, index)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="Start typing a skill..."
                          />
                          {activeSkillIndex === index && skillSuggestions.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                              {skillSuggestions.map((suggestion, i) => (
                                <div
                                  key={i}
                                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                  onClick={() => handleSkillSuggestionClick(suggestion)}
                                >
                                  {suggestion}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <select
                          value={skill.category}
                          onChange={(e) => {
                            const newSkills = [...profileData.technicalSkills];
                            newSkills[index].category = e.target.value as Skill['category'];
                            setProfileData((prev: UserProfileData) => ({ ...prev, technicalSkills: newSkills }));
                          }}
                          className="px-3 py-2 border border-gray-300 rounded-md"
                        >
                          <option value="frontend">Frontend</option>
                          <option value="backend">Backend</option>
                          <option value="ml">ML</option>
                          <option value="design">Design</option>
                          <option value="devops">DevOps</option>
                          <option value="other">Other</option>
                        </select>
                        <select
                          value={skill.proficiency}
                          onChange={(e) => {
                            const newSkills = [...profileData.technicalSkills];
                            newSkills[index].proficiency = e.target.value as Skill['proficiency'];
                            setProfileData((prev: UserProfileData) => ({ ...prev, technicalSkills: newSkills }));
                          }}
                          className="px-3 py-2 border border-gray-300 rounded-md"
                        >
                          <option value="beginner">Beginner</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Advanced</option>
                          <option value="expert">Expert</option>
                        </select>
                        <button
                          onClick={() => {
                            const newSkills = profileData.technicalSkills.filter((_: Skill, i: number) => i !== index);
                            setProfileData((prev: UserProfileData) => ({ ...prev, technicalSkills: newSkills }));
                            setSkillInputs(prev => {
                              const newInputs = { ...prev };
                              delete newInputs[index];
                              return newInputs;
                            });
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      setProfileData((prev: UserProfileData) => ({
                        ...prev,
                        technicalSkills: [...prev.technicalSkills, { name: '', category: 'other', proficiency: 'beginner' }]
                      }));
                    }}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    + Add Skill
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(
                    profileData.technicalSkills.reduce((acc: Record<string, Skill[]>, skill: Skill) => {
                      if (!acc[skill.category]) acc[skill.category] = [];
                      acc[skill.category].push(skill);
                      return acc;
                    }, {} as Record<string, Skill[]>)
                  ).map(([category, skills]) => (
                    <div key={category}>
                      <h3 className="font-medium text-gray-700 capitalize mb-2">{category}</h3>
                      <div className="flex flex-wrap gap-2">
                        {(skills as Skill[]).map((skill: Skill, index: number) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                          >
                            {skill.name}
                            <span className="ml-2 text-xs text-blue-600">({skill.proficiency})</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Experience */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center mb-4">
                <BriefcaseIcon className="h-6 w-6 text-blue-500 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Experience</h2>
              </div>
              {isEditing ? (
                <div className="space-y-4">
                  {profileData.experiences.map((exp: Experience, index: number) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <input
                          type="text"
                          value={exp.title}
                          onChange={(e) => {
                            const newExps = [...profileData.experiences];
                            newExps[index].title = e.target.value;
                            setProfileData((prev: UserProfileData) => ({ ...prev, experiences: newExps }));
                          }}
                          className="px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="Title"
                        />
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => {
                            const newExps = [...profileData.experiences];
                            newExps[index].company = e.target.value;
                            setProfileData((prev: UserProfileData) => ({ ...prev, experiences: newExps }));
                          }}
                          className="px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="Company"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <input
                          type="text"
                          value={exp.startDate}
                          onChange={(e) => {
                            const newExps = [...profileData.experiences];
                            newExps[index].startDate = e.target.value;
                            setProfileData((prev: UserProfileData) => ({ ...prev, experiences: newExps }));
                          }}
                          className="px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="Start Date"
                        />
                        <input
                          type="text"
                          value={exp.endDate}
                          onChange={(e) => {
                            const newExps = [...profileData.experiences];
                            newExps[index].endDate = e.target.value;
                            setProfileData((prev: UserProfileData) => ({ ...prev, experiences: newExps }));
                          }}
                          className="px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="End Date"
                        />
                      </div>
                      <textarea
                        value={exp.description}
                        onChange={(e) => {
                          const newExps = [...profileData.experiences];
                          newExps[index].description = e.target.value;
                          setProfileData((prev: UserProfileData) => ({ ...prev, experiences: newExps }));
                        }}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
                        placeholder="Description"
                      />
                      <div className="flex justify-end">
                        <button
                          onClick={() => {
                            const newExps = profileData.experiences.filter((_: Experience, i: number) => i !== index);
                            setProfileData((prev: UserProfileData) => ({ ...prev, experiences: newExps }));
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      setProfileData((prev: UserProfileData) => ({
                        ...prev,
                        experiences: [...prev.experiences, {
                          id: Date.now().toString(),
                          title: '',
                          company: '',
                          startDate: '',
                          endDate: '',
                          description: '',
                          technologies: [],
                          type: 'work'
                        }]
                      }));
                    }}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    + Add Experience
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {profileData.experiences.map((exp: Experience, index: number) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4">
                      <h3 className="font-semibold text-gray-900">{exp.title}</h3>
                      <p className="text-gray-600">{exp.company}</p>
                      <p className="text-sm text-gray-500">{exp.startDate} - {exp.endDate}</p>
                      <p className="mt-2 text-gray-600">{exp.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Projects */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center mb-4">
                <CodeBracketIcon className="h-6 w-6 text-blue-500 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Projects</h2>
              </div>
              {isEditing ? (
                <div className="space-y-4">
                  {profileData.projects.map((project: Project, index: number) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <input
                        type="text"
                        value={project.name}
                        onChange={(e) => {
                          const newProjects = [...profileData.projects];
                          newProjects[index].name = e.target.value;
                          setProfileData((prev: UserProfileData) => ({ ...prev, projects: newProjects }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
                        placeholder="Project Name"
                      />
                      <textarea
                        value={project.description}
                        onChange={(e) => {
                          const newProjects = [...profileData.projects];
                          newProjects[index].description = e.target.value;
                          setProfileData((prev: UserProfileData) => ({ ...prev, projects: newProjects }));
                        }}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
                        placeholder="Project Description"
                      />
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <input
                          type="text"
                          value={project.role}
                          onChange={(e) => {
                            const newProjects = [...profileData.projects];
                            newProjects[index].role = e.target.value;
                            setProfileData((prev: UserProfileData) => ({ ...prev, projects: newProjects }));
                          }}
                          className="px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="Your Role"
                        />
                        <input
                          type="text"
                          value={project.technologies.join(', ')}
                          onChange={(e) => {
                            const newProjects = [...profileData.projects];
                            newProjects[index].technologies = e.target.value.split(',').map(t => t.trim());
                            setProfileData((prev: UserProfileData) => ({ ...prev, projects: newProjects }));
                          }}
                          className="px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="Technologies (comma-separated)"
                        />
                      </div>
                      <div className="flex justify-end">
                        <button
                          onClick={() => {
                            const newProjects = profileData.projects.filter((_: Project, i: number) => i !== index);
                            setProfileData((prev: UserProfileData) => ({ ...prev, projects: newProjects }));
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      setProfileData((prev: UserProfileData) => ({
                        ...prev,
                        projects: [...prev.projects, {
                          id: Date.now().toString(),
                          name: '',
                          description: '',
                          technologies: [],
                          role: '',
                          startDate: '',
                          endDate: ''
                        }]
                      }));
                    }}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    + Add Project
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {profileData.projects.map((project: Project, index: number) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4">
                      <h3 className="font-semibold text-gray-900">{project.name}</h3>
                      <p className="text-gray-600">{project.description}</p>
                      <p className="text-sm text-gray-500">Role: {project.role}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {project.technologies.map((tech: string, techIndex: number) => (
                          <span
                            key={techIndex}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Education */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center mb-4">
                <AcademicCapIcon className="h-6 w-6 text-blue-500 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Education</h2>
              </div>
              {isEditing ? (
                <div className="space-y-4">
                  {profileData.education.map((edu: Education, index: number) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => {
                          const newEdu = [...profileData.education];
                          newEdu[index].institution = e.target.value;
                          setProfileData((prev: UserProfileData) => ({ ...prev, education: newEdu }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
                        placeholder="Institution"
                      />
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => {
                            const newEdu = [...profileData.education];
                            newEdu[index].degree = e.target.value;
                            setProfileData((prev: UserProfileData) => ({ ...prev, education: newEdu }));
                          }}
                          className="px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="Degree"
                        />
                        <input
                          type="text"
                          value={edu.major}
                          onChange={(e) => {
                            const newEdu = [...profileData.education];
                            newEdu[index].major = e.target.value;
                            setProfileData((prev: UserProfileData) => ({ ...prev, education: newEdu }));
                          }}
                          className="px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="Major"
                        />
                      </div>
                      <div className="flex justify-end">
                        <button
                          onClick={() => {
                            const newEdu = profileData.education.filter((_: Education, i: number) => i !== index);
                            setProfileData((prev: UserProfileData) => ({ ...prev, education: newEdu }));
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      setProfileData((prev: UserProfileData) => ({
                        ...prev,
                        education: [...prev.education, {
                          id: Date.now().toString(),
                          institution: '',
                          degree: '',
                          major: '',
                          startDate: '',
                          endDate: '',
                          relevantCoursework: []
                        }]
                      }));
                    }}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    + Add Education
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {profileData.education.map((edu: Education, index: number) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4">
                      <h3 className="font-semibold text-gray-900">{edu.institution}</h3>
                      <p className="text-gray-600">{edu.degree} in {edu.major}</p>
                      <p className="text-sm text-gray-500">{edu.startDate} - {edu.endDate}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Links */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center mb-4">
                <LinkIcon className="h-6 w-6 text-blue-500 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Links</h2>
              </div>
              {isEditing ? (
                <div className="space-y-4">
                  {Object.entries(profileData.links).map(([platform, url], index) => {
                    const typedUrl = url as string | string[];
                    return (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={typeof typedUrl === 'string' ? typedUrl : typedUrl[0]}
                          onChange={(e) => {
                            setProfileData((prev: UserProfileData) => ({
                              ...prev,
                              links: { ...prev.links, [platform]: e.target.value }
                            }));
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                          placeholder={`${platform} URL`}
                        />
                        <button
                          onClick={() => {
                            const newLinks = { ...profileData.links };
                            delete newLinks[platform as keyof typeof profileData.links];
                            setProfileData((prev: UserProfileData) => ({ ...prev, links: newLinks }));
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    );
                  })}
                  <button
                    onClick={() => {
                      const platform = prompt('Enter platform name (e.g., github, linkedin):');
                      if (platform) {
                        setProfileData((prev: UserProfileData) => ({
                          ...prev,
                          links: { ...prev.links, [platform]: '' }
                        }));
                      }
                    }}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    + Add Link
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {Object.entries(profileData.links).map(([platform, url], index) => {
                    const typedUrl = url as string | string[];
                    return (
                      <a
                        key={index}
                        href={typeof typedUrl === 'string' ? typedUrl : typedUrl[0]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-500 hover:text-blue-700"
                      >
                        <span className="capitalize">{platform}</span>
                        <LinkIcon className="h-4 w-4 ml-2" />
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Save Button */}
        {isEditing && (
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSubmit}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;