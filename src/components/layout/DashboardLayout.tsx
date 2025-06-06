import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  UserGroupIcon,
  LightBulbIcon,
  CalendarIcon,
  BookOpenIcon,
  UserCircleIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

interface NavItem {
  name: string;
  path: string;
  icon: React.ForwardRefExoticComponent<React.SVGProps<SVGSVGElement>>;
}

const navigation: NavItem[] = [
  { name: 'Overview', path: '/dashboard', icon: HomeIcon },
  { name: 'My Projects', path: '/dashboard/projects', icon: ChartBarIcon },
  { name: 'Team Hub', path: '/teams', icon: UserGroupIcon },
  { name: 'Idea Generator', path: '/dashboard/idea-generator', icon: LightBulbIcon },
  { name: 'Hackathons', path: '/dashboard/hackathons', icon: CalendarIcon },
  { name: 'Resources', path: '/dashboard/resources', icon: BookOpenIcon },
  { name: 'Profile', path: '/profile', icon: UserCircleIcon },
];

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 border-b">
            <Link to="/" className="text-2xl font-bold text-blue-600">
              HackHub
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="pl-64">
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout; 