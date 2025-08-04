import React, { useEffect } from 'react';

console.log('REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loadUser } from './redux/authSlice';
import Register from './pages/Register';
import Login from './pages/Login';
import Documents from './pages/Documents';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const dispatch = useDispatch();
  const { isAppLoaded } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

  if (!isAppLoaded) {
    return <div>Loading authentication...</div>; // Or a proper loading spinner
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<Documents />} />
            <Route path="documents" element={<Documents />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Route>

        {/* Catch-all for unmatched routes - redirects to login if not authenticated, or to / if authenticated */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;