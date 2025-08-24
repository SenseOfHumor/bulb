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
  const [editing, setEditing] = useState(false);
  const [temp, setTemp] = useState(data.label || "Untitled");

  const handleDoubleClick = useCallback(() => setEditing(true), []);
  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      const cleaned = (temp || "").trim() || "Untitled";
      data.onChange?.(id, { label: cleaned });
      setEditing(false);
    },
    [id, temp, data]
  );
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") {
        setTemp(data.label || "Untitled");
        setEditing(false);
      }
    },
    [data.label]
  );

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
        type: "bezier",
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

  // Rebuild when inputs change
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

  // Fit after nodes settle
  useEffect(() => {
    if (nodes.length > 0) {
      const id = setTimeout(() => fitView({ padding: 0.2, duration: 300 }), 50);
      return () => clearTimeout(id);
    }
  }, [nodes.length, fitView]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, type: "bezier" }, eds)),
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

/* ============================ Public component ============================ */
export default function MindMapFlowSimple({
  data,
  // spacing
  xGap = 240,             // base horizontal step
  yGap = 120,             // default vertical gap between leaf rows (used if autoYGap=false)
  // horizontal fan controls
  fanByDepth = 0.5,       // ≥1 spreads more each depth
  fanByLeaves = 0.5,      // ≥0 spreads bushier subtrees more
  maxXGap,                // optional cap for very wide canvases
  // visibility caps
  maxVisibleDepth = Infinity,
  maxVisibleNodes = Infinity,
  // callbacks
  onChangeNode,           // (id, {label}) => void
  onDeleteNode,           // (id) => void
  // style
  style,
  // edge look
  dashedEdges = true,

  /* ------- NEW: auto-scale yGap by container height ------- */
  autoYGap = true,        // set to true to compress/expand vertically with container
  minYGap = 60,           // lower clamp so nodes never collapse into each other
  maxYGap = 220,          // upper clamp to avoid huge empty gaps
  yPadding = 40,          // vertical padding inside the container (top & bottom)
}) {
  const containerRef = useRef(null);
  const [containerHeight, setContainerHeight] = useState(0);
  const [effectiveYGap, setEffectiveYGap] = useState(yGap);

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
      if (existingStyle) existingStyle.remove();
    };
  }, []);

  // Observe container size (height) to drive yGap
  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const h = entry.contentRect.height;
        setContainerHeight(h);
      }
    });
    ro.observe(el);
    // initialize
    setContainerHeight(el.getBoundingClientRect().height || 0);
    return () => ro.disconnect();
  }, []);

  // Re-compute effective yGap when height or tree changes
  useEffect(() => {
    if (!autoYGap) {
      setEffectiveYGap(yGap);
      return;
    }
    const leaves = getVisibleLeafCount(data, maxVisibleDepth, maxVisibleNodes);
    const rows = Math.max(1, leaves - 1); // number of gaps between leaf rows
    const available = Math.max(0, containerHeight - 2 * yPadding);

    // Avoid divide-by-zero; if only 1 leaf, just use available so layout stays centered
    const rawGap = rows > 0 ? available / rows : available;
    const clamped =
      Math.max(minYGap, Math.min(maxYGap ?? rawGap, rawGap || minYGap));

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
