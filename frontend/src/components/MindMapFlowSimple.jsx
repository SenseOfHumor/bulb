// MindMapFlowSimple.jsx
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

/* ============================ Dark theme ============================ */
const darkThemeStyles = `
  .react-flow__controls { background: #1a1a1a !important; border: 1px solid #333 !important; }
  .react-flow__controls-button { background: #2a2a2a !important; border-bottom: 1px solid #333 !important; color: #fff !important; }
  .react-flow__controls-button:hover { background: #3a3a3a !important; }
  .react-flow__panel { background: #1a1a1a !important; color: #fff !important; border: 1px solid #333 !important; }
  .react-flow__edge-text { fill: #fff !important; }
  .react-flow__node { color: #fff !important; }
`;

/* ============================ Node UI ============================ */
function NodeCard({ id, data, selected }) {
  const level = data.highlightLevel ?? 0;

  return (
    <div
      className={[
        "rounded-2xl shadow-md border bg-white text-zinc-900 min-w-[160px] max-w-[260px]",
        level === 2
          ? "border-blue-500 ring-2 ring-blue-300"
          : level === 1
          ? "border-blue-300"
          : "border-zinc-300",
        selected ? "outline outline-1 outline-blue-400" : "",
      ].join(" ")}
      style={{
        fontFamily: "Inter, ui-sans-serif, system-ui",
        transition: "transform 120ms ease, box-shadow 120ms ease, opacity 120ms ease",
        transform: level > 0 ? "scale(1.02)" : "scale(1.0)",
        opacity: data.dimmed ? 0.35 : 1,
      }}
    >
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />

      <div className="px-3 py-2 flex items-center gap-2">
        <div
          className="font-medium leading-tight truncate flex-1"
          title={data.label}
          style={{ color: level > 0 ? "#0b63f3" : "#111827" }}
        >
          {data.label || "Untitled"}
        </div>
      </div>
    </div>
  );
}

/* ============================ Layout helpers ============================ */
// 0) Limit tree by depth/node count
function clampTree({ data, maxVisibleDepth = Infinity, maxVisibleNodes = Infinity }) {
  if (!data) return null;
  let count = 0;
  function cloneLimited(node, depth = 0) {
    if (!node || depth > maxVisibleDepth || count >= maxVisibleNodes) return null;
    const copy = { ...node, children: [] };
    count++;
    if (Array.isArray(node.children)) {
      for (const c of node.children) {
        if (count >= maxVisibleNodes) break;
        const cc = cloneLimited(c, depth + 1);
        if (cc) copy.children.push(cc);
      }
    }
    return copy;
  }
  return cloneLimited(data, 0);
}

// 1) Stable ids + depth
function assignIds(node) {
  let next = 0;
  function walk(n, depth = 0) {
    const id = `node-${next++}`;
    return {
      ...n,
      id,
      depth,
      children: (n.children || []).map((c) => walk(c, depth + 1)),
    };
  }
  return walk(node);
}

// 2) Count leaves for proportional vertical slots
function computeLeafCounts(node) {
  if (!node.children || node.children.length === 0) {
    node._leaves = 1;
    return 1;
  }
  node._leaves = node.children.reduce((s, c) => s + computeLeafCounts(c), 0);
  return node._leaves;
}

/**
 * 3) Compact, parent-centered layered layout with **horizontal fan**
 */
function layoutCompactFan(root, xGap, yGap, fanByDepth, fanByLeaves, maxXGap) {
  computeLeafCounts(root);

  function place(n, x, y) {
    n.x = x;
    n.y = y;

    const kids = n.children || [];
    if (kids.length === 0) return;

    const totalLeaves = kids.reduce((s, c) => s + c._leaves, 0);
    let cursorY = y - ((totalLeaves - 1) * yGap) / 2;

    for (const c of kids) {
      const bandHeight = (c._leaves - 1) * yGap;
      const childY = cursorY + bandHeight / 2;

      const depthScale = Math.pow(Math.max(1, fanByDepth), n.depth + 1);
      const leafScale = 1 + Math.max(0, fanByLeaves) * Math.log2(Math.max(1, c._leaves));
      let stepX = xGap * depthScale * leafScale;
      if (maxXGap) stepX = Math.min(stepX, maxXGap);

      place(c, x + stepX, childY);
      cursorY += c._leaves * yGap;
    }
  }

  place(root, 0, 0);
  return root;
}

// 4) Convert to React Flow nodes/edges
function toReactFlow(root, onChange, onDelete, edgeStyle) {
  const nodes = [];
  const edges = [];
  function walk(n) {
    nodes.push({
      id: n.id,
      type: "card",
      position: { x: n.x, y: n.y },
      data: { label: n.title || "Untitled", onChange, onDelete },
    });
    for (const c of n.children || []) {
      edges.push({
        id: `edge-${n.id}-${c.id}`,
        source: n.id,
        target: c.id,
        type: "bezier", // FIX: use built-in type
        animated: false,
        style: edgeStyle,
      });
      walk(c);
    }
  }
  walk(root);
  return { nodes, edges };
}

// 5) Build nodes/edges end-to-end
function buildNodesAndEdges({
  data,
  xGap,
  yGap,
  fanByDepth,
  fanByLeaves,
  maxXGap,
  maxVisibleDepth,
  maxVisibleNodes,
  onChange,
  onDelete,
  edgeStyle,
}) {
  if (!data) return { nodes: [], edges: [] };
  const limited = clampTree({ data, maxVisibleDepth, maxVisibleNodes });
  if (!limited) return { nodes: [], edges: [] };
  const withIds = assignIds(limited);
  const laidOut = layoutCompactFan(withIds, xGap, yGap, fanByDepth, fanByLeaves, maxXGap);
  return toReactFlow(laidOut, onChange, onDelete, edgeStyle);
}

/* Helper: how many visible leaves (for yGap auto-scaling) */
function getVisibleLeafCount(data, maxVisibleDepth, maxVisibleNodes) {
  const limited = clampTree({ data, maxVisibleDepth, maxVisibleNodes });
  if (!limited) return 1;
  const withIds = assignIds(limited);
  computeLeafCounts(withIds);
  return Math.max(1, withIds._leaves || 1);
}

/* ============================ Inner Canvas ============================ */
function InnerCanvas({
  data,
  xGap,
  yGap,
  fanByDepth,
  fanByLeaves,
  maxXGap,
  maxVisibleDepth,
  maxVisibleNodes,
  onChangeNode,
  onDeleteNode,
  edgeStyle,
}) {
  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () =>
      buildNodesAndEdges({
        data,
        xGap,
        yGap,
        fanByDepth,
        fanByLeaves,
        maxXGap,
        maxVisibleDepth,
        maxVisibleNodes,
        onChange: onChangeNode,
        onDelete: onDeleteNode,
        edgeStyle,
      }),
    [
      data,
      xGap,
      yGap,
      fanByDepth,
      fanByLeaves,
      maxXGap,
      maxVisibleDepth,
      maxVisibleNodes,
      onChangeNode,
      onDeleteNode,
      edgeStyle,
    ]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { fitView } = useReactFlow();

  // Build adjacency (children map) from edges for subtree traversal
  const childrenMap = useMemo(() => {
    const map = new Map();
    for (const e of edges) {
      if (!map.has(e.source)) map.set(e.source, []);
      map.get(e.source).push(e.target);
    }
    return map;
  }, [edges]);

  const [selectedRootId, setSelectedRootId] = useState(null);

  // Compute descendant set from selected root
  const highlightedIds = useMemo(() => {
    if (!selectedRootId) return new Set();
    const set = new Set([selectedRootId]);
    const q = [selectedRootId];
    while (q.length) {
      const cur = q.shift();
      const kids = childrenMap.get(cur) || [];
      for (const k of kids) if (!set.has(k)) { set.add(k); q.push(k); }
    }
    return set;
  }, [selectedRootId, childrenMap]);

  // Rebuild when inputs change (NOT dependent on nodes/edges themselves)
  useEffect(() => {
    const { nodes: n, edges: e } = buildNodesAndEdges({
      data,
      xGap,
      yGap,
      fanByDepth,
      fanByLeaves,
      maxXGap,
      maxVisibleDepth,
      maxVisibleNodes,
      onChange: onChangeNode,
      onDelete: onDeleteNode,
      edgeStyle,
    });
    setNodes(n);
    setEdges(e);
  }, [
    data,
    xGap,
    yGap,
    fanByDepth,
    fanByLeaves,
    maxXGap,
    maxVisibleDepth,
    maxVisibleNodes,
    onChangeNode,
    onDeleteNode,
    edgeStyle,
    setNodes,
    setEdges,
  ]);

  // Only update if something actually changes (prevents infinite loops)
  function updateHighlightStyles() {
    if (!selectedRootId) return false;

    let nodesChanged = false;
    setNodes((prev) => {
      const next = prev.map((n) => {
        const inSet = highlightedIds.has(n.id);
        const level = n.id === selectedRootId ? 2 : inSet ? 1 : 0;
        const dimmed = level === 0;

        const prevLevel = n.data?.highlightLevel ?? 0;
        const prevDimmed = n.data?.dimmed ?? false;

        if (prevLevel !== level || prevDimmed !== (selectedRootId ? dimmed : false)) {
          nodesChanged = true;
          return {
            ...n,
            data: {
              ...n.data,
              highlightLevel: level,
              dimmed: dimmed,
            },
          };
        }
        return n;
      });
      return nodesChanged ? next : prev;
    });

    let edgesChanged = false;
    setEdges((prev) => {
      const next = prev.map((e) => {
        const onPath = highlightedIds.has(e.source) && highlightedIds.has(e.target);
        const targetOpacity = onPath ? 1 : 0.2;
        const targetWidth = onPath ? 2.5 : (e.style?.strokeWidth ?? 1.5);

        const prevOpacity = e.style?.opacity ?? 1;
        const prevWidth = e.style?.strokeWidth ?? 1.5;

        if (prevOpacity !== targetOpacity || prevWidth !== targetWidth) {
          edgesChanged = true;
          return {
            ...e,
            style: {
              ...e.style,
              opacity: targetOpacity,
              strokeWidth: targetWidth,
            },
          };
        }
        return e;
      });
      return edgesChanged ? next : prev;
    });

    return nodesChanged || edgesChanged;
  }

  useEffect(() => {
    if (!selectedRootId) {
      // If clearing selection, restore original styles only if needed
      let anyChanged = false;
      setNodes((prev) => {
        const next = prev.map((n) => {
          const hl = n.data?.highlightLevel ?? 0;
          const dm = n.data?.dimmed ?? false;
          if (hl !== 0 || dm !== false) {
            anyChanged = true;
            return { ...n, data: { ...n.data, highlightLevel: 0, dimmed: false } };
          }
          return n;
        });
        return anyChanged ? next : prev;
      });
      let edgesChanged = false;
      setEdges((prev) => {
        const next = prev.map((e) => {
          const op = e.style?.opacity ?? 1;
          const sw = e.style?.strokeWidth ?? 1.5;
          if (op !== 1 || sw !== (e.style?.strokeWidth ?? 1.5)) {
            edgesChanged = true;
            return {
              ...e,
              style: { ...e.style, opacity: 1, strokeWidth: e.style?.strokeWidth ?? 1.5 },
            };
          }
          return e;
        });
        return edgesChanged ? next : prev;
      });
      return;
    }

    updateHighlightStyles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlightedIds, selectedRootId]);

  // Fit after nodes settle
  useEffect(() => {
    if (nodes.length > 0) {
      const id = setTimeout(() => fitView({ padding: 0.2, duration: 300 }), 50);
      return () => clearTimeout(id);
    }
  }, [nodes.length, fitView]);

  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge({ ...params, type: "bezier" }, eds) // keep consistent type
      ),
    [setEdges]
  );

  const nodeTypes = useMemo(() => ({ card: NodeCard }), []);

  // Click handlers
  const onNodeClick = useCallback((_, node) => {
    setSelectedRootId((curr) => (curr === node.id ? null : node.id));
  }, []);
  const onPaneClick = useCallback(() => setSelectedRootId(null), []);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onNodeClick={onNodeClick}
      onPaneClick={onPaneClick}
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
        {/* Show ‘Clear’ only when a root is selected */}
        {selectedRootId && (
          <button
            onClick={() => setSelectedRootId(null)}
            className="ml-2 px-3 py-1 border border-gray-600 rounded bg-gray-800 text-white hover:bg-gray-700"
          >
            Clear Highlight
          </button>
        )}
      </Panel>
    </ReactFlow>
  );
}

/* ============================ Public component ============================ */
export default function MindMapFlowSimple({
  data,
  // spacing
  xGap = 240,
  yGap = 120,
  // horizontal fan controls
  fanByDepth = 0.5,
  fanByLeaves = 0.5,
  maxXGap,
  // visibility caps
  maxVisibleDepth = Infinity,
  maxVisibleNodes = Infinity,
  // callbacks
  onChangeNode,           // (id, {label}) => void
  onDeleteNode,           // kept for compatibility
  // style
  style,
  // edge look
  dashedEdges = true,

  /* ------- Auto-scale yGap by container height ------- */
  autoYGap = true,
  minYGap = 60,
  maxYGap = 220,
  yPadding = 40,
}) {
  const containerRef = useRef(null);
  const [containerHeight, setContainerHeight] = useState(0);
  const [effectiveYGap, setEffectiveYGap] = useState(yGap);

  // Inject dark theme styles once
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
      if (existingStyle) existingStyle.remove();
    };
  }, []);

  // Observe container height (for auto yGap)
  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerHeight(entry.contentRect.height);
      }
    });
    ro.observe(el);
    setContainerHeight(el.getBoundingClientRect().height || 0);
    return () => ro.disconnect();
  }, []);

  // Compute effective yGap from height + leaves
  useEffect(() => {
    if (!autoYGap) {
      setEffectiveYGap(yGap);
      return;
    }
    const leaves = getVisibleLeafCount(data, maxVisibleDepth, maxVisibleNodes);
    const rows = Math.max(1, leaves - 1);
    const available = Math.max(0, containerHeight - 2 * yPadding);
    const rawGap = rows > 0 ? available / rows : available;
    const clamped = Math.max(minYGap, Math.min(maxYGap ?? rawGap, rawGap || minYGap));
    setEffectiveYGap(Number.isFinite(clamped) ? clamped : yGap);
  }, [
    autoYGap,
    yGap,
    data,
    containerHeight,
    yPadding,
    minYGap,
    maxYGap,
    maxVisibleDepth,
    maxVisibleNodes,
  ]);

  const edgeStyle = useMemo(
    () => ({
      strokeWidth: 1.5,
      ...(dashedEdges ? { strokeDasharray: "4 4" } : {}),
    }),
    [dashedEdges]
  );

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%", ...(style || {}) }}>
      <ReactFlowProvider>
        <InnerCanvas
          data={data}
          xGap={xGap}
          yGap={effectiveYGap}
          fanByDepth={fanByDepth}
          fanByLeaves={fanByLeaves}
          maxXGap={maxXGap}
          maxVisibleDepth={maxVisibleDepth}
          maxVisibleNodes={maxVisibleNodes}
          onChangeNode={onChangeNode}
          onDeleteNode={onDeleteNode}
          edgeStyle={edgeStyle}
        />
      </ReactFlowProvider>
    </div>
  );
}
