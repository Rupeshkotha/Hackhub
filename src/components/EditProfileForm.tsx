import React, { useState, useEffect } from 'react';
import { UserProfileData, saveUserProfile } from '../utils/firestoreUtils';
import { TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

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

interface EditProfileFormProps {
  initialData: UserProfileData;
  onSave: (data: UserProfileData) => void;
  onCancel: () => void;
}

const EditProfileForm: React.FC<EditProfileFormProps> = ({ initialData, onSave, onCancel }) => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState<UserProfileData>(initialData);
  const [skillInputs, setSkillInputs] = useState<{ [key: number]: string }>({});
  const [skillSuggestions, setSkillSuggestions] = useState<string[]>([]);
  const [activeSkillIndex, setActiveSkillIndex] = useState<number>(-1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
    setLoading(false);
  }, [initialData]);

  const handleSkillInputChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    setSkillInputs(prev => ({ ...prev, [index]: value }));

    // Filter suggestions based on input
    if (value.trim()) {
      const filtered = commonSkills.filter(skill => 
        skill.toLowerCase().includes(value.toLowerCase()) &&
        !formData.technicalSkills.some(s => s.name.toLowerCase() === skill.toLowerCase())
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
      const newSkills = [...formData.technicalSkills];
      newSkills[activeSkillIndex] = {
        name: suggestion,
        category: newSkills[activeSkillIndex].category,
        proficiency: newSkills[activeSkillIndex].proficiency
      };
      setFormData(prev => ({ ...prev, technicalSkills: newSkills }));
      setSkillInputs(prev => ({ ...prev, [activeSkillIndex]: suggestion }));
      setSkillSuggestions([]);
      setActiveSkillIndex(-1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setError('You must be logged in to save your profile');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Save to Firestore
      await saveUserProfile(currentUser.uid, formData);
      
      // Call the parent's onSave callback
      onSave(formData);
      
      setSuccess('Profile saved successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const addEducation = () => {
    setFormData(prev => ({
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
  };

  const addExperience = () => {
    setFormData(prev => ({
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
  };

  const addProject = () => {
    setFormData(prev => ({
      ...prev,
      projects: [...prev.projects, {
        id: Date.now().toString(),
        name: '',
        description: '',
        technologies: [],
        role: '',
        startDate: '',
        endDate: '',
        demoLink: '',
        repoLink: ''
      }]
    }));
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6 space-y-8">
      {/* Basic Info */}
      <div className="bg-gray-50 rounded-lg p-6 space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Full Stack Developer"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
            rows={4}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Tell us about yourself..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., San Francisco, CA"
          />
        </div>
      </div>

      {/* Education */}
      <div className="bg-gray-50 rounded-lg p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Education</h2>
          <button
            type="button"
            onClick={addEducation}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Education
          </button>
        </div>
        <div className="space-y-6">
          {formData.education.map((edu, index) => (
            <div key={edu.id} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex justify-between items-start">
                <div className="flex-1 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
                    <input
                      type="text"
                      value={edu.institution}
                      onChange={(e) => {
                        const newEducation = [...formData.education];
                        newEducation[index].institution = e.target.value;
                        setFormData(prev => ({ ...prev, education: newEducation }));
                      }}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => {
                          const newEducation = [...formData.education];
                          newEducation[index].degree = e.target.value;
                          setFormData(prev => ({ ...prev, education: newEducation }));
                        }}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Major</label>
                      <input
                        type="text"
                        value={edu.major}
                        onChange={(e) => {
                          const newEducation = [...formData.education];
                          newEducation[index].major = e.target.value;
                          setFormData(prev => ({ ...prev, education: newEducation }));
                        }}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={edu.startDate}
                        onChange={(e) => {
                          const newEducation = [...formData.education];
                          newEducation[index].startDate = e.target.value;
                          setFormData(prev => ({ ...prev, education: newEducation }));
                        }}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                      <input
                        type="date"
                        value={edu.endDate}
                        onChange={(e) => {
                          const newEducation = [...formData.education];
                          newEducation[index].endDate = e.target.value;
                          setFormData(prev => ({ ...prev, education: newEducation }));
                        }}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newEducation = formData.education.filter((_, i) => i !== index);
                    setFormData(prev => ({ ...prev, education: newEducation }));
                  }}
                  className="ml-4 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Experience */}
      <div className="bg-gray-50 rounded-lg p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Experience</h2>
          <button
            type="button"
            onClick={addExperience}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Experience
          </button>
        </div>
        <div className="space-y-6">
          {formData.experiences.map((exp, index) => (
            <div key={exp.id} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex justify-between items-start">
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                      <input
                        type="text"
                        value={exp.title}
                        onChange={(e) => {
                          const newExperiences = [...formData.experiences];
                          newExperiences[index].title = e.target.value;
                          setFormData(prev => ({ ...prev, experiences: newExperiences }));
                        }}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => {
                          const newExperiences = [...formData.experiences];
                          newExperiences[index].company = e.target.value;
                          setFormData(prev => ({ ...prev, experiences: newExperiences }));
                        }}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={exp.startDate}
                        onChange={(e) => {
                          const newExperiences = [...formData.experiences];
                          newExperiences[index].startDate = e.target.value;
                          setFormData(prev => ({ ...prev, experiences: newExperiences }));
                        }}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                      <input
                        type="date"
                        value={exp.endDate}
                        onChange={(e) => {
                          const newExperiences = [...formData.experiences];
                          newExperiences[index].endDate = e.target.value;
                          setFormData(prev => ({ ...prev, experiences: newExperiences }));
                        }}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={exp.description}
                      onChange={(e) => {
                        const newExperiences = [...formData.experiences];
                        newExperiences[index].description = e.target.value;
                        setFormData(prev => ({ ...prev, experiences: newExperiences }));
                      }}
                      rows={3}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newExperiences = formData.experiences.filter((_, i) => i !== index);
                    setFormData(prev => ({ ...prev, experiences: newExperiences }));
                  }}
                  className="ml-4 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Projects */}
      <div className="bg-gray-50 rounded-lg p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
          <button
            type="button"
            onClick={addProject}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Project
          </button>
        </div>
        <div className="space-y-6">
          {formData.projects.map((project, index) => (
            <div key={project.id} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex justify-between items-start">
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                      <input
                        type="text"
                        value={project.name}
                        onChange={(e) => {
                          const newProjects = [...formData.projects];
                          newProjects[index].name = e.target.value;
                          setFormData(prev => ({ ...prev, projects: newProjects }));
                        }}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Your Role</label>
                      <input
                        type="text"
                        value={project.role}
                        onChange={(e) => {
                          const newProjects = [...formData.projects];
                          newProjects[index].role = e.target.value;
                          setFormData(prev => ({ ...prev, projects: newProjects }));
                        }}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Lead Developer"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={project.description}
                      onChange={(e) => {
                        const newProjects = [...formData.projects];
                        newProjects[index].description = e.target.value;
                        setFormData(prev => ({ ...prev, projects: newProjects }));
                      }}
                      rows={3}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={project.startDate}
                        onChange={(e) => {
                          const newProjects = [...formData.projects];
                          newProjects[index].startDate = e.target.value;
                          setFormData(prev => ({ ...prev, projects: newProjects }));
                        }}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                      <input
                        type="date"
                        value={project.endDate}
                        onChange={(e) => {
                          const newProjects = [...formData.projects];
                          newProjects[index].endDate = e.target.value;
                          setFormData(prev => ({ ...prev, projects: newProjects }));
                        }}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Demo Link</label>
                      <input
                        type="url"
                        value={project.demoLink || ''}
                        onChange={(e) => {
                          const newProjects = [...formData.projects];
                          newProjects[index].demoLink = e.target.value;
                          setFormData(prev => ({ ...prev, projects: newProjects }));
                        }}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://demo-link.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Repository Link</label>
                      <input
                        type="url"
                        value={project.repoLink || ''}
                        onChange={(e) => {
                          const newProjects = [...formData.projects];
                          newProjects[index].repoLink = e.target.value;
                          setFormData(prev => ({ ...prev, projects: newProjects }));
                        }}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://github.com/username/project"
                      />
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newProjects = formData.projects.filter((_, i) => i !== index);
                    setFormData(prev => ({ ...prev, projects: newProjects }));
                  }}
                  className="ml-4 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Technical Skills */}
      <div className="bg-gray-50 rounded-lg p-6 space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Technical Skills</h2>
        <div className="space-y-4">
          {formData.technicalSkills.map((skill, index) => (
            <div key={index} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={skillInputs[index] || skill.name}
                    onChange={(e) => handleSkillInputChange(e, index)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Start typing a skill..."
                  />
                  {activeSkillIndex === index && skillSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
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
                    const newSkills = [...formData.technicalSkills];
                    newSkills[index].category = e.target.value as any;
                    setFormData(prev => ({ ...prev, technicalSkills: newSkills }));
                  }}
                  className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    const newSkills = [...formData.technicalSkills];
                    newSkills[index].proficiency = e.target.value as any;
                    setFormData(prev => ({ ...prev, technicalSkills: newSkills }));
                  }}
                  className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
                <button
                  type="button"
                  onClick={() => {
                    const newSkills = formData.technicalSkills.filter((_, i) => i !== index);
                    setFormData(prev => ({ ...prev, technicalSkills: newSkills }));
                    setSkillInputs(prev => {
                      const newInputs = { ...prev };
                      delete newInputs[index];
                      return newInputs;
                    });
                  }}
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => {
              setFormData(prev => ({
                ...prev,
                technicalSkills: [...prev.technicalSkills, { name: '', category: 'other', proficiency: 'beginner' }]
              }));
            }}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Skill
          </button>
        </div>
      </div>

      {/* Links */}
      <div className="bg-gray-50 rounded-lg p-6 space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">GitHub</label>
            <input
              type="url"
              value={formData.links.github}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                links: { ...prev.links, github: e.target.value }
              }))}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://github.com/username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
            <input
              type="url"
              value={formData.links.linkedin}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                links: { ...prev.links, linkedin: e.target.value }
              }))}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://linkedin.com/in/username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio</label>
            <input
              type="url"
              value={formData.links.portfolio}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                links: { ...prev.links, portfolio: e.target.value }
              }))}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://your-portfolio.com"
            />
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="mt-4 p-4 bg-green-50 text-green-700 rounded-lg">
          {success}
        </div>
      )}
    </form>
  );
};

export default EditProfileForm; 