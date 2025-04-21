import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { authAPI } from './utils/api';
import Navbar from './components/Navbar';
import LoginForm from './components/auth/LoginForm';
import CreatePost from './pages/CreatePost';
import ScheduledPosts from './pages/ScheduledPosts';
import Settings from './pages/Settings';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthLayout from './components/auth/AuthLayout';
import ProtectedRoute from './components/ProtectedRoute';
import { getAuth, signOut } from 'firebase/auth'; // 🔐 Import Firebase signOut

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // 🔐 AUTH CHECK
  useEffect(() => {
    const checkAuth = async () => {
      const params = new URLSearchParams(location.search);
      const userId = params.get('userId') || localStorage.getItem('userId');

      if (currentUser && userId) {
        try {
          const authStatus = await authAPI.checkAuthStatus(userId);

          if (authStatus.authenticated) {
            setUser(authStatus.user);
            localStorage.setItem('userId', userId);

            // Save login timestamp
            if (!localStorage.getItem('loginTimestamp')) {
              localStorage.setItem('loginTimestamp', Date.now().toString());
            }

            if (params.has('userId')) {
              navigate(location.pathname, { replace: true });
            }
          } else {
            localStorage.removeItem('userId');
            setUser(null);
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('userId');
          setUser(null);
        }
      } else {
        setUser(null);
        localStorage.removeItem('userId');
      }

      setLoading(false);
    };

    checkAuth();
  }, [location, navigate, currentUser]);

  useEffect(() => {
    const oneHour = 60 * 60 * 1000; 

    const checkCacheExpiration = async () => {
      const loginTimestamp = localStorage.getItem('loginTimestamp');

      if (loginTimestamp && Date.now() - parseInt(loginTimestamp, 10) > oneHour) {
        console.log('[Cache] Session expired. Clearing all cache and signing out...');

        // Sign out Firebase Auth
        try {
          await signOut(getAuth());
        } catch (err) {
          console.error('Firebase signOut failed:', err);
        }

        // Clear local/session storage
        localStorage.clear();
        sessionStorage.clear();

        // Clear service worker cache
        if ('caches' in window) {
          caches.keys().then(names => {
            names.forEach(name => caches.delete(name));
          });
        }

        // Redirect to home/login page
        window.location.href = '/';
      }
    };

    const interval = setInterval(checkCacheExpiration, 60 * 1000); // check every minute
    return () => clearInterval(interval);
  }, []);

  // 🔄 LOADING SPINNER
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // 🧭 ROUTES
  return (
    <Routes>
      <Route
        path="/"
        element={
          <AuthLayout>
            <LoginForm />
          </AuthLayout>
        }
      />

      {/* Protected App */}
      <Route
        path="*"
        element={
          <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar user={user} />

            <main className="flex-1 container mx-auto px-4 py-6">
              <Routes>
                <Route
                  path="/create"
                  element={
                    <ProtectedRoute user={user}>
                      <CreatePost user={user} />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/scheduled"
                  element={
                    <ProtectedRoute user={user}>
                      <ScheduledPosts user={user} />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute user={user}>
                      <Settings user={user} />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </main>

            <footer className="py-4 bg-white border-t border-gray-200">
              <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
                &copy; {new Date().getFullYear()} Neurodude. All rights reserved.
              </div>
            </footer>
          </div>
        }
      />
    </Routes>
  );
}

export default function AppWithProvider() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}
