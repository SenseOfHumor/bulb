// RecursiveFlow.jsx
import React, { useMemo, useRef, useEffect, useCallback, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  MarkerType,
  Panel,
  useNodesState,
  useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";
import dagre from "dagre";

/**
 * Expected data shape (recursive):
 * {
 *   title: string,
 *   collapsed?: boolean,
 *   children?: Array<same>
 * }
 *
 * IDs are derived from the JSON path to be stable across renders.
 */

// ----- Layout config -----
const NODE_W = 260;
const NODE_H = 72;

function layoutWithDagre(nodes, edges, { rankdir = "TB", nodesep = 30, ranksep = 60 } = {}) {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir, nodesep, ranksep, marginx: 16, marginy: 16 });
  g.setDefaultEdgeLabel(() => ({}));

  nodes.forEach((n) => g.setNode(n.id, { width: NODE_W, height: NODE_H }));
  edges.forEach((e) => g.setEdge(e.source, e.target));
  dagre.layout(g);

  return nodes.map((n) => {
    const pos = g.node(n.id);
    return {
      ...n,
      position: { x: pos.x - NODE_W / 2, y: pos.y - NODE_H / 2 },
      draggable: false,
    };
  });
}

// ----- Utilities to traverse any-depth JSON -----
/** Builds a stable string id from the index path. */
const idFromPath = (pathArr) => (pathArr.length ? pathArr.join("/") : "root");

/** Walk the tree, returning:
 * - byId map with metadata
 * - rootId
 */
function indexTree(root) {
  const byId = {};
  const walk = (node, path = []) => {
    const id = idFromPath(path);
    const children = Array.isArray(node.children) ? node.children : [];
    const meta = {
      id,
      title: node.title ?? "Untitled",
      collapsed: !!node.collapsed,
      hasChildren: children.length > 0,
      childrenIds: children.map((_, i) => idFromPath([...path, i])),
      path,
      raw: node,
    };
    byId[id] = meta;
    children.forEach((child, i) => walk(child, [...path, i]));
  };
  walk(root, []);
  return { byId, rootId: "root" };
}

/** Build visible nodes/edges given a collapsed set. Recursive expand until a collapsed node is hit. */
function buildGraph({ rootId, byId, collapsedSet, maxNodes = null }) {
  const nodes = [];
  const edges = [];
  const visit = (id) => {
    // Stop if we've reached the maximum number of nodes
    if (maxNodes && nodes.length >= maxNodes) return;
    
    const m = byId[id];
    const isCollapsed = collapsedSet.has(id);
    nodes.push({
      id,
      type: "rfNode",
      data: {
        title: m.title,
        hasChildren: m.hasChildren,
        isCollapsed,
      },
      position: { x: 0, y: 0 },
    });
    if (!isCollapsed && m.hasChildren && (!maxNodes || nodes.length < maxNodes)) {
      m.childrenIds.forEach((cid) => {
        // Stop adding edges if we've reached max nodes
        if (maxNodes && nodes.length >= maxNodes) return;
        
        edges.push({
          id: `${id}->${cid}`,
          source: id,
          target: cid,
          type: "smoothstep",
          markerEnd: { type: MarkerType.ArrowClosed },
        });
        visit(cid);
      });
    }
  };
  visit(rootId);
  return { nodes, edges };
}

// ----- Pretty Node -----
const RFNode = ({ data }) => {
  const { title, hasChildren, isCollapsed } = data;
  return (
    <div
      className="group relative w-[260px] min-h-[72px] rounded-2xl p-[1px]
                 bg-gradient-to-b from-white/30 to-white/5
                 shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_6px_30px_rgba(0,0,0,0.25)]
                 hover:shadow-[0_0_0_1px_rgba(80,160,255,0.25),0_8px_40px_rgba(64,128,255,0.25)]
                 transition-shadow"
      style={{ backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", pointerEvents: 'auto' }}
    >
      <div className="rounded-2xl bg-gradient-to-b from-slate-900/70 to-slate-900/40 p-3">
        <div className="flex items-start gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10">
            <svg width="16" height="16" viewBox="0 0 24 24" className="opacity-80">
              <circle cx="12" cy="12" r="4" fill="currentColor" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-white/95 leading-snug">{title}</div>
            <div className="mt-1 text-[11px] text-white/60">
              {hasChildren ? (isCollapsed ? "Collapsed" : "Expanded") : "Leaf"}
            </div>
          </div>
          {hasChildren && (
            <div className="rounded-lg px-2 py-1 text-[11px] text-white/70 bg-white/5 ring-1 ring-white/10">
              {isCollapsed ? "Show" : "Hide"}
            </div>
          )}
        </div>
      </div>
      <Handle type="target" position={Position.Top} className="!bg-white/70" />
      <Handle type="source" position={Position.Bottom} className="!bg-white/70" />
    </div>
  );
};

const nodeTypes = { rfNode: RFNode };

// ----- Main: RecursiveFlow -----
export default function RecursiveFlow({
  data,                      // your JSON root object
  direction = "TB",          // "TB" | "LR" | "BT" | "RL"
  nodesep = 30,
  ranksep = 60,
  fitOnChange = true,
  className = "",
  style,
  // Start collapsed from a certain depth (0 = root, 1 = children of root, etc.)
  initialCollapsedDepth = null, // null = honor data.collapsed flags
  onToggle,                  // optional callback (id, nextCollapsed)
  maxNodes = 15,             // Maximum number of nodes to display
}) {
  const rf = useRef(null);

  // Index once per data change
  const { byId, rootId } = useMemo(() => indexTree(data), [data]);

  // Initialize collapsed set
  const initialCollapsed = useMemo(() => {
    const set = new Set();
    Object.values(byId).forEach((m) => {
      const depth = m.path.length;
      if (initialCollapsedDepth !== null) {
        if (depth > initialCollapsedDepth && m.hasChildren) set.add(m.id);
      } else if (m.collapsed) {
        set.add(m.id);
      }
    });
    return set;
  }, [byId, initialCollapsedDepth]);

  const [collapsedSet, setCollapsedSet] = useState(initialCollapsed);

  // Build graph and apply layout
  const graph = useMemo(() => buildGraph({ rootId, byId, collapsedSet, maxNodes }), [rootId, byId, collapsedSet, maxNodes]);
  const laidOut = useMemo(
    () => layoutWithDagre(graph.nodes, graph.edges, { rankdir: direction, nodesep, ranksep }),
    [graph.nodes, graph.edges, direction, nodesep, ranksep]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(laidOut);
  const [edges, setEdges, onEdgesChange] = useEdgesState(graph.edges);

  useEffect(() => {
    setNodes(laidOut);
    setEdges(graph.edges);
  }, [laidOut, graph.edges, setNodes, setEdges]);

  // Fit on (re)layout
  const onInit = useCallback((inst) => {
    rf.current = inst;
    inst.fitView({ padding: 0.2, duration: 400 });
  }, []);

  useEffect(() => {
    if (rf.current && fitOnChange) rf.current.fitView({ padding: 0.2, duration: 400 });
  }, [nodes, edges, fitOnChange]);

  // Toggle collapse on node click
  const onNodeClick = useCallback(
    (_, node) => {
      const meta = byId[node.id];
      if (!meta?.hasChildren) return;
      setCollapsedSet((prev) => {
        const next = new Set(prev);
        const willCollapse = !prev.has(node.id);
        if (willCollapse) next.add(node.id);
        else next.delete(node.id);
        onToggle?.(node.id, willCollapse);
        return next;
      });
    },
    [byId, onToggle]
  );

  const edgeStyles = {
    style: { strokeWidth: 1.6, stroke: "rgba(200,210,255,0.7)" },
    animated: false,
    markerEnd: { type: MarkerType.ArrowClosed, color: "rgba(200,210,255,0.9)" },
  };

  return (
    <div 
      className={`relative h-[620px] w-full rounded-2xl border border-white/10 overflow-hidden ${className}`} 
      style={style}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges.map((e) => ({ ...edgeStyles, ...e }))}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        proOptions={{ hideAttribution: true }}
        panOnScroll={false}
        panOnDrag={true}
        selectionOnDrag
        zoomOnDoubleClick={false}
        zoomOnScroll={false}
        onInit={onInit}
        fitView
        style={{ pointerEvents: 'none' }}
      >
        {/* <Panel position="top-left" className="m-2">
          <div className="rounded-xl bg-white/5 px-3 py-1.5 text-xs text-white/80 ring-1 ring-white/10">
            Click a node to expand/collapse its branch • Showing {nodes.length}/{maxNodes} nodes
          </div>
        </Panel> */}

        {/* Custom Glassmorphic Controls */}
        <div className="absolute bottom-4 left-4 z-10" style={{ pointerEvents: 'auto' }}>
          <div className="flex flex-col gap-1 p-1 rounded-2xl bg-gradient-to-b from-white/30 to-white/5 shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_6px_30px_rgba(0,0,0,0.25)] backdrop-blur-md">
            <button
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 text-white/80 hover:bg-white/10 hover:text-white transition-all ring-1 ring-white/10"
              onClick={() => rf.current?.zoomIn()}
              title="Zoom in"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
                <line x1="8" y1="11" x2="14" y2="11"/>
                <line x1="11" y1="8" x2="11" y2="14"/>
              </svg>
            </button>
            <button
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 text-white/80 hover:bg-white/10 hover:text-white transition-all ring-1 ring-white/10"
              onClick={() => rf.current?.zoomOut()}
              title="Zoom out"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
                <line x1="8" y1="11" x2="14" y2="11"/>
              </svg>
            </button>
            <button
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 text-white/80 hover:bg-white/10 hover:text-white transition-all ring-1 ring-white/10"
              onClick={() => rf.current?.fitView({ padding: 0.2, duration: 400 })}
              title="Fit view"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
              </svg>
            </button>
          </div>
        </div>

        <Background gap={24} size={1} className="opacity-60" />
      </ReactFlow>
    </div>
  );
}
