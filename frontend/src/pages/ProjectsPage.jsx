import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ProjectsPage() {
  const [projects] = useState([
    {
      id: 1,
      name: "Board Meeting Transcript",
      date: "2025-08-19",
      status: "completed",
      actionItems: 8,
      researchLinks: 15
    },
    {
      id: 2,
      name: "Interview Notes - John Doe",
      date: "2025-08-18",
      status: "processing",
      actionItems: 3,
      researchLinks: 7
    },
    {
      id: 3,
      name: "Research Document",
      date: "2025-08-17",
      status: "completed",
      actionItems: 12,
      researchLinks: 23
    }
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'processing':
        return 'bg-yellow-500';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Your Projects
                </h1>
                <p className="text-white/70">
                  Manage and access your analyzed documents
                </p>
              </div>
              <Link
                to="/upload"
                className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                + New Project
              </Link>
            </div>

            <div className="space-y-4">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 hover:bg-white/10 transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-white">
                          {project.name}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs text-white ${getStatusColor(
                            project.status
                          )}`}
                        >
                          {project.status}
                        </span>
                      </div>
                      <p className="text-white/60 mb-4">
                        Created on {new Date(project.date).toLocaleDateString()}
                      </p>
                      
                      <div className="flex gap-6 mb-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-sky-400">
                            {project.actionItems}
                          </div>
                          <div className="text-white/60 text-xs">Action Items</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-400">
                            {project.researchLinks}
                          </div>
                          <div className="text-white/60 text-xs">Research Links</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-sm transition-colors">
                        View Graph
                      </button>
                      <button className="bg-sky-500 hover:bg-sky-600 text-white px-3 py-1 rounded text-sm transition-colors">
                        Open Project
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {projects.length === 0 && (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">📂</div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  No projects yet
                </h3>
                <p className="text-white/60 mb-6">
                  Upload your first document to get started
                </p>
                <Link
                  to="/upload"
                  className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Upload Document
                </Link>
              </div>
            )}

            <div className="flex justify-center mt-8">
              <Link
                to="/dashboard"
                className="text-white/70 hover:text-white transition-colors"
              >
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
