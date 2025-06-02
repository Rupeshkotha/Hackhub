import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import {
  ChartBarIcon,
  UserGroupIcon,
  LightBulbIcon,
  CalendarIcon,
  BookOpenIcon,
  BellIcon,
} from '@heroicons/react/24/outline';

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();

  return (
    <DashboardLayout>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back!</h1>
        <p className="mt-2 text-gray-600">Here's what's happening with your hackathon journey.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <ChartBarIcon className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Projects</p>
              <p className="text-2xl font-semibold text-gray-900">0</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <UserGroupIcon className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Team Members</p>
              <p className="text-2xl font-semibold text-gray-900">0</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Upcoming Events</p>
              <p className="text-2xl font-semibold text-gray-900">0</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <BellIcon className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Notifications</p>
              <p className="text-2xl font-semibold text-gray-900">0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-8">
          {/* Active Projects */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Active Projects</h2>
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No active projects yet</p>
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                  Start New Project
                </button>
              </div>
            </div>
          </div>

          {/* Team Invitations */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Team Invitations</h2>
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No pending invitations</p>
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                  Find Teams
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* AI Idea Generator */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">AI Idea Generator</h2>
              <p className="text-gray-500 mb-6">Get AI-powered hackathon project ideas tailored to your skills and interests.</p>
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                <LightBulbIcon className="w-5 h-5 mr-2" />
                Generate Ideas
              </button>
            </div>
          </div>

          {/* Upcoming Hackathons */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Hackathons</h2>
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No upcoming hackathons</p>
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                  Browse Hackathons
                </button>
              </div>
            </div>
          </div>

          {/* Quick Resources */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Resources</h2>
              <div className="space-y-4">
                <a href="#" className="flex items-center p-3 rounded-lg hover:bg-gray-50">
                  <BookOpenIcon className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-gray-700">Hackathon Preparation Guide</span>
                </a>
                <a href="#" className="flex items-center p-3 rounded-lg hover:bg-gray-50">
                  <BookOpenIcon className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-gray-700">Team Formation Tips</span>
                </a>
                <a href="#" className="flex items-center p-3 rounded-lg hover:bg-gray-50">
                  <BookOpenIcon className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-gray-700">Project Presentation Templates</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard; 