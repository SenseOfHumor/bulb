// ActionPlanFlow.jsx
import React, { useMemo, useState, useCallback, useEffect, useRef } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  MarkerType,
  Panel,
} from "reactflow";
import "reactflow/dist/style.css";
import dagre from "dagre";

// ---------- Sample data (you can pass this in as a prop instead) ----------
const actionsMap = {
  title: "Investigation Plan",
  children: [
    { title: "Ingest transcript" },
    {
      title: "Extract action items",
      children: [{ title: "Assign owners" }, { title: "Set due dates" }],
    },
    {
      title: "Research & verify",
      children: [
        { title: "Collect citations from source A/B" },
        { title: "Cross-source check conflicting claims" },
      ],
    },
    {
      title: "Build knowledge graph",
      collapsed: true, // start collapsed (optional)
      children: [{ title: "People & orgs" }, { title: "Claims & evidence" }],
    },
  ],
};

// ---------------------- Layout via dagre ----------------------
const g = new dagre.graphlib.Graph().setGraph({ rankdir: "TB", nodesep: 30, ranksep: 60 }).setDefaultEdgeLabel(() => ({}));

const NODE_W = 260;
const NODE_H = 72;

function applyLayout(nodes, edges) {
  g.setGraph({ rankdir: "TB", nodesep: 30, ranksep: 60, marginx: 20, marginy: 20 });
  nodes.forEach((n) => g.setNode(n.id, { width: NODE_W, height: NODE_H }));
  edges.forEach((e) => g.setEdge(e.source, e.target));
  dagre.layout(g);

  return nodes.map((n) => {
    const pos = g.node(n.id);
    return {
      ...n,
      position: { x: pos.x - NODE_W / 2, y: pos.y - NODE_H / 2 },
      // Let React Flow know we’ve positioned them
      draggable: false,
    };
  });
}

// ---------------------- Helpers to build graph ----------------------
let __id = 0;
const makeId = () => `node-${++__id}`;

function normalizeTree(root) {
  // Assign stable ids and index children map
  const byId = {};
  function walk(node, parentId = null) {
    const id = makeId();
    const hasChildren = Array.isArray(node.children) && node.children.length > 0;
    const norm = {
      id,
      title: node.title ?? "Untitled",
      parentId,
      hasChildren,
      collapsed: !!node.collapsed,
      children: [],
    };
    byId[id] = norm;
    if (hasChildren) {
      for (const child of node.children) {
        const childId = walk(child, id);
        norm.children.push(childId);
      }
    }
    return id;
  }
  const rootId = walk(root, null);
  return { rootId, byId };
}

function buildVisibleGraph(rootId, byId, collapsedSet) {
  const nodes = [];
  const edges = [];

  function addSubtree(id) {
    const n = byId[id];
    const isCollapsed = collapsedSet.has(id);
    nodes.push({
      id,
      type: "actionNode",
      data: {
        title: n.title,
        hasChildren: n.hasChildren,
        isCollapsed,
      },
      position: { x: 0, y: 0 }, // temporary, layout will place
    });

    if (!isCollapsed && n.hasChildren) {
      for (const cid of n.children) {
        edges.push({
          id: `${id}-${cid}`,
          source: id,
          target: cid,
          type: "smoothstep",
          animated: false,
          markerEnd: { type: MarkerType.ArrowClosed },
        });
        addSubtree(cid);
      }
    }
  }

  addSubtree(rootId);
  return { nodes, edges };
}

// ---------------------- Custom Node ----------------------
function Chevron({ open }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" className={`transition-transform ${open ? "rotate-180" : ""}`}>
      <path d="M7 10l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

const ActionNode = ({ id, data }) => {
  const { title, hasChildren, isCollapsed } = data;

  return (
    <div
      className="group relative w-[260px] min-h-[72px] rounded-2xl p-[1px]
                 bg-gradient-to-b from-white/30 to-white/5 shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_6px_30px_rgba(0,0,0,0.25)]
                 hover:shadow-[0_0_0_1px_rgba(80,160,255,0.25),0_8px_40px_rgba(64,128,255,0.25)] transition-shadow"
      style={{
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
    >
      <div className="rounded-2xl bg-gradient-to-b from-slate-900/70 to-slate-900/40 p-3">
        <div className="flex items-start gap-2">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10"
            aria-hidden
          >
            {/* tiny dot icon */}
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
            <div className="flex items-center justify-center">
              <div className="rounded-lg px-2 py-1 text-[11px] text-white/70 bg-white/5 ring-1 ring-white/10">
                {isCollapsed ? "Show" : "Hide"}
              </div>
            </div>
          )}
        </div>

        {/* Click affordance overlay */}
        {hasChildren && (
          <div className="absolute right-2 top-2 text-white/70">
            <Chevron open={!isCollapsed} />
          </div>
        )}
      </div>

      {/* React Flow connection handles (top/bottom) */}
      <Handle type="target" position={Position.Top} className="!bg-white/70" />
      <Handle type="source" position={Position.Bottom} className="!bg-white/70" />
    </div>
  );
};

const nodeTypes = { actionNode: ActionNode };

// ---------------------- Main Component ----------------------
export default function ActionPlanFlow({
  tree = actionsMap,
  fitOnChange = true,
  dark = true,
}) {
  const flowRef = useRef(null);

  // Normalize once
  const { rootId, byId } = useMemo(() => normalizeTree(tree), [tree]);

  // Track collapsed nodes in a Set
  const initialCollapsed = useMemo(() => {
    const set = new Set();
    for (const id in byId) {
      if (byId[id].collapsed) set.add(id);
    }
    return set;
  }, [byId]);

  const [collapsed, setCollapsed] = useState(initialCollapsed);

  // Build visible graph from collapsed state
  const graph = useMemo(() => buildVisibleGraph(rootId, byId, collapsed), [rootId, byId, collapsed]);

  const laidOut = useMemo(() => applyLayout(graph.nodes, graph.edges), [graph]);

  const [nodes, setNodes, onNodesChange] = useNodesState(laidOut);
  const [edges, setEdges, onEdgesChange] = useEdgesState(graph.edges);

  // Sync state when graph/laidOut changes
  useEffect(() => {
    setNodes(laidOut);
    setEdges(graph.edges);
  }, [laidOut, graph.edges, setNodes, setEdges]);

  // Fit view nicely after (re)layout
  const onInit = useCallback((instance) => {
    flowRef.current = instance;
    instance.fitView({ padding: 0.2, duration: 400 });
  }, []);

  useEffect(() => {
    if (flowRef.current && fitOnChange) {
      flowRef.current.fitView({ padding: 0.2, duration: 400 });
    }
  }, [nodes, edges, fitOnChange]);

  // Node click toggles collapse if the node has children
  const onNodeClick = useCallback(
    (_, node) => {
      const meta = byId[node.id];
      if (!meta?.hasChildren) return;
      setCollapsed((prev) => {
        const next = new Set(prev);
        if (next.has(node.id)) next.delete(node.id);
        else next.add(node.id);
        return next;
      });
    },
    [byId]
  );

  // Styling helpers
  const edgeOptions = {
    style: { strokeWidth: 1.6, stroke: "rgba(200,210,255,0.7)" },
    animated: false,
    markerEnd: { type: MarkerType.ArrowClosed, color: "rgba(200,210,255,0.9)" },
  };

  return (
    <div className={`${dark ? "dark" : ""}`}>
      <div className="h-[600px] w-full rounded-2xl border border-white/10 bg-gradient-to-b from-slate-950 to-slate-900 overflow-hidden">
        <ReactFlow
          nodes={nodes}
          edges={edges.map((e) => ({ ...edgeOptions, ...e }))}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          panOnScroll
          panOnDrag
          selectionOnDrag
          zoomOnScroll
          zoomOnDoubleClick={false}
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          proOptions={{ hideAttribution: true }}
          fitView
          onInit={onInit}
        >
          <Panel position="top-left" className="m-2">
            <div className="rounded-xl bg-white/5 px-3 py-1.5 text-xs text-white/80 ring-1 ring-white/10">
              Click a node to {`expand/collapse`} its branch
            </div>
          </Panel>

          <MiniMap
            zoomable
            pannable
            maskColor="rgba(15,23,42,0.9)"
            nodeColor={() => "rgba(148,163,184,0.9)"} // slate-400
            nodeStrokeColor={() => "rgba(203,213,225,0.9)"} // slate-300
          />

          <Controls showInteractive={false} className="!bg-slate-900/70 !text-white/80 !border-white/10" />

          <Background gap={24} size={1} className="opacity-60" />
        </ReactFlow>
      </div>
    </div>
  );
}
