import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  Handle,
  Position,
  Panel,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

// Dark theme styles
const darkThemeStyles = `
  .react-flow__controls { background: #1a1a1a !important; border: 1px solid #333 !important; }
  .react-flow__controls-button { background: #2a2a2a !important; border-bottom: 1px solid #333 !important; color: #fff !important; }
  .react-flow__controls-button:hover { background: #3a3a3a !important; }
  .react-flow__panel { background: #1a1a1a !important; color: #fff !important; border: 1px solid #333 !important; }
  .react-flow__edge-text { fill: #fff !important; }
  .react-flow__node { color: #fff !important; }
`;

// Custom Node Component
function NodeCard({ id, data, selected }) {
  const [editing, setEditing] = useState(false);
  const [temp, setTemp] = useState(data.label || "Untitled");

  const handleDoubleClick = useCallback(() => {
    setEditing(true);
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    const cleaned = (temp || "").trim() || "Untitled";
    data.onChange?.(id, { label: cleaned });
    setEditing(false);
  }, [id, temp, data]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      setTemp(data.label || "Untitled");
      setEditing(false);
    }
  }, [data.label]);

  return (
    <div
      onDoubleClick={handleDoubleClick}
      className={`rounded-2xl shadow-md border ${
        selected ? "border-blue-500" : "border-zinc-300"
      } bg-white text-zinc-900 min-w-[160px] max-w-[260px]`}
      style={{ fontFamily: "Inter, ui-sans-serif, system-ui" }}
    >
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      
      <div className="px-3 py-2 flex items-center gap-2">
        {!editing ? (
          <>
            <div className="font-medium leading-tight truncate flex-1" title={data.label}>
              {data.label || "Untitled"}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                data.onDelete?.(id);
              }}
              className="text-zinc-500 hover:text-red-600"
              title="Delete"
            >
              🗑️
            </button>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="flex items-center gap-2 w-full">
            <input
              type="text"
              value={temp}
              onChange={(e) => setTemp(e.target.value)}
              onKeyDown={handleKeyDown}
              className="text-sm border-0 outline-0 bg-transparent flex-1"
              autoFocus
              onBlur={handleSubmit}
            />
          </form>
        )}
      </div>
    </div>
  );
}

// Convert tree data to nodes and edges
function buildNodesAndEdges(data, xGap = 260, yGap = 110) {
  if (!data) return { nodes: [], edges: [] };
  
  const nodes = [];
  const edges = [];
  let nodeId = 0;
  
  function traverse(node, x = 0, y = 0, parentId = null) {
    const id = `node-${nodeId++}`;
    
    nodes.push({
      id,
      type: 'card',
      position: { x, y },
      data: { 
        label: node.title || 'Untitled',
        onChange: () => {}, // Placeholder
        onDelete: () => {} // Placeholder
      },
    });
    
    if (parentId) {
      edges.push({
        id: `edge-${parentId}-${id}`,
        source: parentId,
        target: id,
        animated: true,
      });
    }
    
    if (node.children && Array.isArray(node.children)) {
      node.children.forEach((child, index) => {
        const childX = x + xGap;
        const childY = y + (index - (node.children.length - 1) / 2) * yGap;
        traverse(child, childX, childY, id);
      });
    }
    
    return id;
  }
  
  traverse(data);
  return { nodes, edges };
}

// Inner Canvas Component
function InnerCanvas({ data, xGap, yGap }) {
  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => buildNodesAndEdges(data, xGap, yGap),
    [data, xGap, yGap]
  );
  
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { fitView } = useReactFlow();

  // Update nodes when data changes
  useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = buildNodesAndEdges(data, xGap, yGap);
    setNodes(newNodes);
    setEdges(newEdges);
  }, [data, xGap, yGap, setNodes, setEdges]);

  // Fit view when nodes change
  useEffect(() => {
    if (nodes.length > 0) {
      setTimeout(() => fitView({ padding: 0.2, duration: 300 }), 100);
    }
  }, [nodes.length, fitView]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const nodeTypes = useMemo(() => ({ card: NodeCard }), []);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      nodeTypes={nodeTypes}
      fitView
      fitViewOptions={{ padding: 0.2 }}
      proOptions={{ hideAttribution: true }}
      style={{ width: "100%", height: "100%" }}
    >
      <Controls />
      <Background variant="dots" gap={20} size={1} color="#333" />
      <Panel position="top-left" className="space-x-2">
        <button
          onClick={() => fitView({ padding: 0.2, duration: 300 })}
          className="px-3 py-1 border border-gray-600 rounded bg-gray-800 text-white hover:bg-gray-700"
        >
          Fit View
        </button>
      </Panel>
    </ReactFlow>
  );
}

// Main Component
export default function MindMapFlowSimple({
  data,
  xGap = 260,
  yGap = 110,
  style,
}) {
  const containerRef = useRef(null);

  // Inject dark theme styles
  useEffect(() => {
    const id = "reactflow-dark-theme";
    if (!document.getElementById(id)) {
      const styleEl = document.createElement("style");
      styleEl.id = id;
      styleEl.textContent = darkThemeStyles;
      document.head.appendChild(styleEl);
    }
    return () => {
      const existingStyle = document.getElementById(id);
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%", ...(style || {}) }}>
      <ReactFlowProvider>
        <InnerCanvas data={data} xGap={xGap} yGap={yGap} />
      </ReactFlowProvider>
    </div>
  );
}
