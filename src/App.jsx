import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import Landing from '@/pages/Landing';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import ImageEditor from '@/pages/ImageEditor';
import VideoCreator from '@/pages/VideoCreator';
import VideoEditor from '@/pages/VideoEditor';
import AudioStudio from '@/pages/AudioStudio';
import Projects from '@/pages/Projects';
import Pricing from '@/pages/Pricing';
import Settings from '@/pages/Settings';
import AIChatbot from '@/components/AIChatbot';
import InstallPrompt from '@/components/InstallPrompt';
import OfflineIndicator from '@/components/OfflineIndicator';
import { syncManager } from '@/lib/offlineSync';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return !user ? children : <Navigate to="/dashboard" />;
};

function App() {
  useEffect(() => {
    syncManager.initListener();
  }, []);

  return (
    <Router>
      <AuthProvider>
        <Helmet>
          <title>NovaVid - Professional Multimedia Editing Platform</title>
          <meta name="description" content="Create stunning videos, edit images, and generate AI-powered audio with NovaVid's comprehensive multimedia editing suite." />
        </Helmet>
        
        {/* Global PWA UI Elements */}
        <OfflineIndicator />
        
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />
          <Route 
            path="/register" 
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/image-editor" 
            element={
              <ProtectedRoute>
                <ImageEditor />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/video-creator" 
            element={
              <ProtectedRoute>
                <VideoCreator />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/video-editor" 
            element={
              <ProtectedRoute>
                <VideoEditor />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/audio-studio" 
            element={
              <ProtectedRoute>
                <AudioStudio />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/projects" 
            element={
              <ProtectedRoute>
                <Projects />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } 
          />
        </Routes>
        
        {/* Global AI Assistant & PWA Prompt */}
        <AIChatbot />
        <InstallPrompt />
        
        <Toaster />
      </AuthProvider>
    </Router>
  );
}

export default App;