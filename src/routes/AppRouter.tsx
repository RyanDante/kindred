import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import OnboardingScreen from '../pages/onboarding/Onboarding';
import Home from '../pages/home/HomePage';
import SubmitOrphanage from '../pages/listing/OrphanageListing';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminEditOrphanage from '../pages/admin/AdminEditOrphanage';
import UserProfile from '../pages/profile/UserProfile';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children }: { children: React.ReactElement }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }: { children: React.ReactElement }) {
  const { user } = useAuth();
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const isAdmin = !!(user && (user.email?.startsWith('admin@') || user.email === 'admin@kindred.org' || user.email === 'admin@kindred.cm'));
  
  return isLocal || isAdmin ? children : <Navigate to="/login" replace />;
}

function About() {
  return <div className="p-10 text-4xl">About Page</div>;
}


export default function AppRouter() {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(
    localStorage.getItem('onboardingComplete') === 'true'
  );

  return (
    <BrowserRouter>
      <Routes>

        {/* First Screen */}
        <Route
          path="/"
          element={
            hasCompletedOnboarding
              ? <Navigate to="/home" />
              : <OnboardingScreen  onComplete={() => {
                  localStorage.setItem('onboardingComplete', 'true');
                  setHasCompletedOnboarding(true);
                }}/>
          }
        />

        {/* Main Pages */}
        <Route path="/home" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/submit" element={<ProtectedRoute><SubmitOrphanage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/edit/:id" element={<AdminRoute><AdminEditOrphanage /></AdminRoute>} />

        {/* 404 */}
        <Route
          path="*"
          element={
            <div className="h-screen flex items-center justify-center text-3xl font-bold">
              404 - Page Not Found
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}