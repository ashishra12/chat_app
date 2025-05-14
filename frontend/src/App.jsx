import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Loader } from 'lucide-react';
// import { useAuth } from './hooks/useAuth';
import SignUpPage from './pages/SignUpPage';
import LoginPage from './pages/LoginPage';
import SettingsPage from './pages/SettingPage';
import ProfilePage from './pages/ProfilePage';
import HomePage from './pages/HomePage';
import Navbar from './components/Navbar';
import Toaster from 'react-hot-toast'

import { useAuthStore } from './store/useAuthStore';
import { useThemeStore } from './store/useThemeStore';
const App = () => {
  const { authUser, isCheckingAuth, checkAuth } = useAuthStore(); 
const { theme } = useThemeStore();
  useEffect(() => {
    checkAuth(); // Check auth on mount
  }, [checkAuth]);

  if (isCheckingAuth && !authUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="w-10 h-10 animate-spin" />
      </div>
    );
  }

  return (
    <div data-theme={theme}> 
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={authUser ? <HomePage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/signup"
          element={!authUser ? <SignUpPage /> : <Navigate to="/" replace />}
        />
        <Route
          path="/login"
          element={!authUser ? <LoginPage /> : <Navigate to="/" replace />}
        />
        <Route
          path="/settings"
          element={authUser ? <SettingsPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/profile"
          element={authUser ? <ProfilePage /> : <Navigate to="/login" replace />}
        />
      </Routes>
      <Toaster/>
    </div>
  );
};

export default App;
