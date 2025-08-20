import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import './App.css';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import UploadPage from './pages/UploadPage';
import ProjectsPage from './pages/ProjectsPage';
import KnowledgeGraphPage from './pages/KnowledgeGraphPage';
import AssistantPage from './pages/AssistantPage';

// Component to handle authenticated user redirect from landing page
function AuthenticatedLandingRedirect() {
  const { isLoaded, isSignedIn } = useAuth();
  
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }
  
  if (isSignedIn) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <LandingPage />;
}

export default function App() {
  return (
    <Router basename="/bulb">
      <div className="min-h-screen bg-black">
        <Navbar />
        <Routes>
          {/* Public route - Landing page with auth redirect */}
          <Route path="/" element={<AuthenticatedLandingRedirect />} />
          
          {/* Protected routes - require authentication */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/upload" 
            element={
              <ProtectedRoute>
                <UploadPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/projects" 
            element={
              <ProtectedRoute>
                <ProjectsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/knowledge-graph" 
            element={
              <ProtectedRoute>
                <KnowledgeGraphPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/assistant" 
            element={
              <ProtectedRoute>
                <AssistantPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Catch-all route - redirect to appropriate page based on auth state */}
          <Route path="*" element={<AuthenticatedLandingRedirect />} />
        </Routes>
      </div>
    </Router>
  );
}