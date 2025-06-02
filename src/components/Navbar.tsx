import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserCircleIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';

const Navbar: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">HackHub</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {currentUser ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  to="/profile"
                  className="text-gray-700 hover:text-blue-600 p-2 rounded-md"
                  title="Profile"
                >
                  <UserCircleIcon className="h-6 w-6" />
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-blue-600 p-2 rounded-md"
                  title="Logout"
                >
                  <ArrowLeftOnRectangleIcon className="h-6 w-6" />
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 