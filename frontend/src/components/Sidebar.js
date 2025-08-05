import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../redux/authSlice';
import { toast } from 'react-hot-toast';

function Sidebar({ isSidebarOpen, setSidebarOpen }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Logged out successfully!');
    navigate('/login');
  };

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden ${isSidebarOpen ? 'block' : 'hidden'}`}
        onClick={() => setSidebarOpen(false)}
      ></div>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 w-64 bg-gray-800 text-white flex flex-col h-full z-30 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0`}
      >
        <div className="p-4 text-2xl font-bold border-b border-gray-700 flex justify-between items-center">
          <span>Enterprise Platform</span>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-2">
          <Link to="/documents" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700" onClick={() => setSidebarOpen(false)}>
            Documents
          </Link>
          <Link to="/analytics" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700" onClick={() => setSidebarOpen(false)}>
            Analytics
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-700">
          <Link to="/profile" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 mb-2" onClick={() => setSidebarOpen(false)}>
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
    </>
  );
}

export default Sidebar;
