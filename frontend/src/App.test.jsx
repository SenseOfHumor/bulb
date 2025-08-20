import './App.css'
import { 
  ClerkLoaded, 
  ClerkLoading,
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from '@clerk/clerk-react'

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <ClerkLoading>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-white text-xl">Loading authentication...</div>
        </div>
      </ClerkLoading>
      
      <ClerkLoaded>
        <nav className="p-4 bg-white/10 backdrop-blur-xl">
          <div className="flex justify-between items-center">
            <h1 className="text-white text-2xl font-bold">BULB</h1>
            <div className="flex gap-4">
              <SignedOut>
                <SignInButton>
                  <button className="bg-blue-500 text-white px-4 py-2 rounded">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton>
                  <button className="bg-green-500 text-white px-4 py-2 rounded">
                    Sign Up
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </div>
          </div>
        </nav>
        
        <main className="p-8">
          <SignedOut>
            <div className="text-white text-center">
              <h2 className="text-4xl mb-4">Welcome to BULB</h2>
              <p className="text-xl">Please sign in to continue</p>
            </div>
          </SignedOut>
          
          <SignedIn>
            <div className="text-white text-center">
              <h2 className="text-4xl mb-4">Dashboard</h2>
              <p className="text-xl">You are signed in!</p>
            </div>
          </SignedIn>
        </main>
      </ClerkLoaded>
    </div>
  )
}
