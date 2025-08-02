
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../redux/authSlice';
import { Toaster, toast } from 'react-hot-toast';

function Sidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Logged out successfully!');
    navigate('/login');
  };

  return (
    <div className="w-64 bg-gray-800 text-white flex flex-col">
      <Toaster />
      <div className="p-4 text-2xl font-bold border-b border-gray-700">
        Enterprise Platform
      </div>
      <nav className="flex-1 px-2 py-4 space-y-2">
        <Link to="/dashboard" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700">
          Dashboard
        </Link>
        <Link to="/documents" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700">
          Documents
        </Link>
        <Link to="/analytics" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700">
          Analytics
        </Link>
        </nav>
      <div className="p-4 border-t border-gray-700">
        <Link to="/profile" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 mb-2">
          Profile
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
