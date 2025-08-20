import { Navigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';

export default function ProtectedRoute({ children }) {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    // Show loading state while Clerk is loading
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!isSignedIn) {
    // Redirect to landing page if not signed in
    return <Navigate to="/" replace />;
  }

  // Render the protected component if authenticated
  return children;
}
