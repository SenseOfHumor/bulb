import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import './App.css';
import Navbar from './components/Navbar';
import AppLayout from './components/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import MindMapPage from './pages/Dashboard';
import DashboardPage from './pages/DashboardPage';
import UploadPage from './pages/UploadPage';
import ProjectsPage from './pages/ProjectsPage';
import KnowledgeGraphPage from './pages/KnowledgeGraphPage';
import AssistantPage from './pages/AssistantPage';
import ReactFlowPage from './pages/ReactFlow';
import NotePage from './pages/NotePage';

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
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <Router basename="/bulb">
      <div className="min-h-screen bg-black">
        {/* Show navbar only for unauthenticated users */}
        {!isSignedIn && <Navbar />}

        <Routes>
          <Route path="/mindmap" element={<ProtectedRoute><AppLayout><MindMapPage /></AppLayout></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><AppLayout><DashboardPage /></AppLayout></ProtectedRoute>} />
          <Route path="/upload" element={<ProtectedRoute><AppLayout><UploadPage /></AppLayout></ProtectedRoute>} />
          <Route path="/projects" element={<ProtectedRoute><AppLayout><ProjectsPage /></AppLayout></ProtectedRoute>} />
          <Route path="/knowledge-graph" element={<ProtectedRoute><AppLayout><KnowledgeGraphPage /></AppLayout></ProtectedRoute>} />
          <Route path="/assistant" element={<ProtectedRoute><AppLayout><AssistantPage /></AppLayout></ProtectedRoute>} />
          <Route path="/react-flow" element={<ProtectedRoute><AppLayout><ReactFlowPage /></AppLayout></ProtectedRoute>} />
          <Route path="/note/:id" element={<ProtectedRoute><AppLayout><NotePage /></AppLayout></ProtectedRoute>} />
          {/* Catch-all route - redirect to appropriate page based on auth state */}
          <Route path="*" element={<AuthenticatedLandingRedirect />} />
        </Routes>
      </div>
    </Router>
  );
}