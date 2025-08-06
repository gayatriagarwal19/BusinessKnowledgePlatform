import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadUser, changePassword } from '../redux/authSlice';
import { toast, Toaster } from 'react-hot-toast';
import { logout } from '../redux/authSlice';
import { useNavigate } from 'react-router-dom';
function Profile() {
  const dispatch = useDispatch();
  const { user, isLoading, error } = useSelector((state) => state.auth);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
      if (error === "Token is not valid") {
        console.log('entering profile error useEffect');
        toast.error("Session expired. Please log in again.");
        dispatch(logout());
        navigate('/login'); // Ensure the toast is shown only once
      }
    }, [dispatch, navigate, error]);

  useEffect(() => {
    if (!user) {
      dispatch(loadUser());
    }
  }, [dispatch, user]);

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmNewPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }

    try {
      const resultAction = await dispatch(changePassword({ oldPassword, newPassword }));
      if (changePassword.fulfilled.match(resultAction)) {
        toast.success('Password updated successfully!');
        setOldPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      } else {
        toast.error(resultAction.payload?.msg || 'Failed to update password');
      }
    } catch (err) {
      toast.error('An error occurred while changing password');
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Toaster />
      <h1 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-2">User Profile</h1>

      {isLoading && <p className="text-center text-gray-500">Loading profile data...</p>}
      {error && <p className="text-center text-red-500">Error: {error.msg || 'Could not load profile'}</p>}

      {user && user.user && user.documentCounts && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Profile Information Card */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Account Information</h2>
            <div className="space-y-2">
              <p className="text-gray-600"><span className="font-medium">Email:</span> {user.user.email}</p>
            </div>

            <h2 className="text-xl font-semibold mt-6 mb-4 text-gray-700">Document Statistics</h2>
            <div className="space-y-2">
              <p className="text-gray-600"><span className="font-medium">Bills:</span> {user.documentCounts.bills}</p>
              <p className="text-gray-600"><span className="font-medium">Feedback:</span> {user.documentCounts.feedback}</p>
              <p className="text-gray-600"><span className="font-medium">Revenue:</span> {user.documentCounts.revenue}</p>
            </div>
          </div>

          {/* Change Password Card */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Change Password</h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-700">Old Password</label>
                <input
                  type="password"
                  id="oldPassword"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmNewPassword"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  disabled={isLoading}
                >
                  {isLoading ? 'Updating...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;