import { useUser } from '@clerk/clerk-react';

export default function Dashboard() {
  const { user } = useUser();

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-white mb-4">
                Welcome to BULB Dashboard
              </h1>
              <p className="text-white/70 text-lg">
                Hello, {user?.firstName || 'User'}! Ready to transform your notes?
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                <h3 className="text-xl font-semibold text-white mb-3">
                  Upload Transcript
                </h3>
                <p className="text-white/60 mb-4">
                  Upload your meeting transcript or notes to get started with AI-powered analysis.
                </p>
                <button className="w-full bg-sky-500 hover:bg-sky-600 text-white py-2 px-4 rounded-lg transition-colors">
                  Upload File
                </button>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                <h3 className="text-xl font-semibold text-white mb-3">
                  Recent Projects
                </h3>
                <p className="text-white/60 mb-4">
                  Access your previously analyzed documents and research projects.
                </p>
                <button className="w-full bg-sky-500 hover:bg-sky-600 text-white py-2 px-4 rounded-lg transition-colors">
                  View Projects
                </button>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                <h3 className="text-xl font-semibold text-white mb-3">
                  Knowledge Graph
                </h3>
                <p className="text-white/60 mb-4">
                  Explore connections between people, organizations, and claims in your research.
                </p>
                <button className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition-colors">
                  Open Graph
                </button>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                <h3 className="text-xl font-semibold text-white mb-3">
                  Research Assistant
                </h3>
                <p className="text-white/60 mb-4">
                  Get help from TRACE, your AI research assistant for fact-checking and analysis.
                </p>
                <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg transition-colors">
                  Ask TRACE
                </button>
              </div>
            </div>
            
            <div className="mt-8 p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-3">
                Quick Stats
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-sky-400">0</div>
                  <div className="text-white/60 text-sm">Documents</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-sky-400">0</div>
                  <div className="text-white/60 text-sm">Action Items</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">0</div>
                  <div className="text-white/60 text-sm">Research Links</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-400">0</div>
                  <div className="text-white/60 text-sm">Graph Nodes</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
