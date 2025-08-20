import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function KnowledgeGraphPage() {
  const [selectedNode, setSelectedNode] = useState(null);
  
  // Mock knowledge graph data
  const nodes = [
    { id: 1, label: "Action Item", type: "action", x: 200, y: 150, connections: [2, 3] },
    { id: 2, label: "Research Topic", type: "research", x: 300, y: 100, connections: [1, 4] },
    { id: 3, label: "Decision Point", type: "decision", x: 150, y: 200, connections: [1, 5] },
    { id: 4, label: "Key Finding", type: "insight", x: 400, y: 150, connections: [2] },
    { id: 5, label: "Follow-up Task", type: "action", x: 100, y: 250, connections: [3] }
  ];

  const getNodeColor = (type) => {
    switch (type) {
      case 'action':
        return '#06b6d4'; // sky-500
      case 'research':
        return '#8b5cf6'; // violet-500
      case 'decision':
        return '#f59e0b'; // amber-500
      case 'insight':
        return '#10b981'; // emerald-500
      default:
        return '#6b7280'; // gray-500
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Knowledge Graph
                </h1>
                <p className="text-white/70">
                  Explore connections between your analyzed content
                </p>
              </div>
              <div className="flex gap-3">
                <select className="bg-white/10 text-white rounded-lg px-3 py-2 border border-white/20">
                  <option>All Projects</option>
                  <option>Board Meeting Transcript</option>
                  <option>Interview Notes - John Doe</option>
                </select>
                <button className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg transition-colors">
                  Export Graph
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Graph Visualization */}
              <div className="lg:col-span-2">
                <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Graph Visualization
                  </h3>
                  
                  <div className="relative bg-slate-800/50 rounded-lg" style={{ height: '400px' }}>
                    <svg width="100%" height="100%" className="absolute inset-0">
                      {/* Draw connections */}
                      {nodes.map(node => 
                        node.connections.map(connId => {
                          const connectedNode = nodes.find(n => n.id === connId);
                          if (!connectedNode) return null;
                          return (
                            <line
                              key={`${node.id}-${connId}`}
                              x1={node.x}
                              y1={node.y}
                              x2={connectedNode.x}
                              y2={connectedNode.y}
                              stroke="rgba(255,255,255,0.3)"
                              strokeWidth="2"
                            />
                          );
                        })
                      )}
                      
                      {/* Draw nodes */}
                      {nodes.map(node => (
                        <g key={node.id}>
                          <circle
                            cx={node.x}
                            cy={node.y}
                            r="20"
                            fill={getNodeColor(node.type)}
                            stroke="white"
                            strokeWidth="2"
                            className="cursor-pointer hover:opacity-80"
                            onClick={() => setSelectedNode(node)}
                          />
                          <text
                            x={node.x}
                            y={node.y + 35}
                            textAnchor="middle"
                            fill="white"
                            fontSize="12"
                            className="pointer-events-none"
                          >
                            {node.label}
                          </text>
                        </g>
                      ))}
                    </svg>
                  </div>
                  
                  <div className="mt-4 flex gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-sky-500"></div>
                      <span className="text-white/70">Action Items</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-violet-500"></div>
                      <span className="text-white/70">Research</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                      <span className="text-white/70">Decisions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                      <span className="text-white/70">Insights</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Node Details */}
              <div className="lg:col-span-1">
                <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Node Details
                  </h3>
                  
                  {selectedNode ? (
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: getNodeColor(selectedNode.type) }}
                        ></div>
                        <span className="text-white font-medium">{selectedNode.label}</span>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <span className="text-white/60 text-sm">Type:</span>
                          <p className="text-white capitalize">{selectedNode.type}</p>
                        </div>
                        
                        <div>
                          <span className="text-white/60 text-sm">Connections:</span>
                          <p className="text-white">{selectedNode.connections.length} nodes</p>
                        </div>
                        
                        <div>
                          <span className="text-white/60 text-sm">Source Document:</span>
                          <p className="text-white">Board Meeting Transcript</p>
                        </div>
                        
                        <div>
                          <span className="text-white/60 text-sm">Context:</span>
                          <p className="text-white/80 text-sm">
                            This node represents a key element extracted from your documents. 
                            Click on connected nodes to explore relationships.
                          </p>
                        </div>
                      </div>
                      
                      <button className="w-full mt-4 bg-purple-500 hover:bg-purple-600 text-white py-2 rounded-lg transition-colors">
                        View in Context
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-4">🎯</div>
                      <p className="text-white/60">
                        Click on a node in the graph to view its details
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Graph Statistics */}
                <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 mt-6">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Graph Statistics
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-white/60">Total Nodes:</span>
                      <span className="text-white font-medium">127</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Connections:</span>
                      <span className="text-white font-medium">89</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Action Items:</span>
                      <span className="text-sky-400 font-medium">23</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Research Topics:</span>
                      <span className="text-violet-400 font-medium">15</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

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
