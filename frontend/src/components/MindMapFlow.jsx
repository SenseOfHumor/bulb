// MindMapFlow.jsx — single-file component for @xyflow/react v11+
// Adds:
//  - Wider horizontal spread via xGrowth
//  - Collapsible deep nesting via maxVisibleDepth (+ expand on dblclick)
// Keeps:
//  - Dark theme, edit/delete, reconnect, dblclick/dbltap create, robust fit

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  addEdge,
  reconnectEdge,
  useEdgesState,
  useNodesState,
  useReactFlow,
  Handle,
  Position,
  Panel,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

/* ---------------------- Dark theme tweaks ---------------------- */
const darkThemeStyles = `
  .react-flow__controls { background: #1a1a1a !important; border: 1px solid #333 !important; }
  .react-flow__controls-button { background: #2a2a2a !important; border-bottom: 1px solid #333 !important; color: #fff !important; }
  .react-flow__controls-button:hover { background: #3a3a3a !important; }
  .react-flow__panel { background: #1a1a1a !important; color: #fff !important; border: 1px solid #333 !important; }
  .react-flow__edge-text { fill: #fff !important; }
  .react-flow__node { color: #fff !important; }
`;

/* ------------------------ Custom Node -------------------------- */
function NodeCard({ id, data, selected }) {
  const [editing, setEditing] = useState(false);
  const [temp, setTemp] = useState(data.label || "Untitled");

  const commit = useCallback(() => {
    const cleaned = (temp || "").trim() || "Untitled";
    data.onChange?.(id, { label: cleaned });
    setEditing(false);
  }, [id, temp, data]);

  const cancel = useCallback(() => {
    setTemp(data.label || "Untitled");
    setEditing(false);
  }, [data.label]);

  const isCollapsed = data.collapsed === true;

  return (
    <div
      onDoubleClick={(e) => {
        if (isCollapsed) {
          e.stopPropagation();
          data.onExpand?.(id);
        } else {
          setEditing(true);
        }
      }}
      className={`rounded-2xl shadow-md border ${
        selected ? "border-blue-500" : "border-zinc-300"
      } bg-white text-zinc-900 min-w-[160px] max-w-[280px]`}
      style={{ fontFamily: "Inter, ui-sans-serif, system-ui" }}
    >
      <div className="px-3 py-2 flex items-center gap-2">
        {!editing || isCollapsed ? (
          <>
            <div className="font-medium leading-tight truncate flex-1" title={data.label}>
              {data.label || "Untitled"}
            </div>
            {isCollapsed && (
              <button
                aria-label="Expand"
                onClick={(e) => {
                  e.stopPropagation();
                  data.onExpand?.(id);
                }}
                className="text-zinc-600 hover:text-zinc-800 text-sm border rounded px-2 py-0.5"
                title="Expand"
              >
                Expand
              </button>
            )}
            {!isCollapsed && (
              <>
                <button
                  aria-label="Rename"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditing(true);
                  }}
                  className="text-zinc-500 hover:text-zinc-700"
                  title="Rename"
                >
                  ✏️
                </button>
                <button
                  aria-label="Delete"
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
            )}
          </>
        ) : (
          <form
            className="flex items-center gap-2 w-full"
            onSubmit={(e) => {
              e.preventDefault();
              commit();
            }}
          >
            <input
              autoFocus
              className="flex-1 outline-none border rounded px-2 py-1 text-sm"
              value={temp}
              onChange={(e) => setTemp(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  e.preventDefault();
                  cancel();
                }
              }}
              onBlur={commit}
            />
            <button type="submit" className="px-2 py-1 text-sm border rounded">
              Save
            </button>
          </form>
        )}
      </div>

      {/* four handles */}
      <Handle type="source" position={Position.Top} />
      <Handle type="source" position={Position.Right} />
      <Handle type="target" position={Position.Left} />
      <Handle type="target" position={Position.Bottom} />
    </div>
  );
}

/* ---------------------- Flow State Hook ------------------------ */
function useFlowActions(initialNodes = [], initialEdges = []) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const rf = useReactFlow();

  const idRef = useRef(1);

  const addNodeAt = useCallback(
    (pos, label = `Node ${idRef.current}`) => {
      const id = `n${idRef.current++}`;
      setNodes((nds) => nds.concat({ id, type: "card", position: pos, data: { label } }));
      requestAnimationFrame(() =>
        rf.fitView({ padding: 0.2, duration: 120, includeHiddenNodes: true })
      );
      return id;
    },
    [setNodes, rf]
  );

  // batch replace (for JSON builds)
  const setGraph = useCallback((newNodes, newEdges) => {
    setNodes(newNodes);
    setEdges(newEdges);
  }, [setNodes, setEdges]);

  const deleteById = useCallback(
    (id) => {
      setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
      setNodes((nds) => nds.filter((n) => n.id !== id));
    },
    [setEdges, setNodes]
  );

  const onConnect = useCallback(
    (conn) => setEdges((eds) => addEdge({ ...conn, animated: true }, eds)),
    [setEdges]
  );

  // sever/reconnect support
  const reconnectOk = useRef(true);
  const reconnectingEdgeId = useRef(null);

  const onReconnectStart = useCallback((_, edge) => {
    reconnectOk.current = false;
    reconnectingEdgeId.current = edge?.id ?? null;
  }, []);

  const onReconnect = useCallback(
    (oldEdge, newConn) => {
      reconnectOk.current = true; // valid handle found
      setEdges((eds) => reconnectEdge(oldEdge, newConn, eds));
    },
    [setEdges]
  );

  const onReconnectEnd = useCallback(() => {
    if (!reconnectOk.current && reconnectingEdgeId.current) {
      const victim = reconnectingEdgeId.current;
      setEdges((eds) => eds.filter((e) => e.id !== victim));
    }
    reconnectOk.current = true;
    reconnectingEdgeId.current = null;
  }, [setEdges]);

  const renameNode = useCallback(
    (id, patch) =>
      setNodes((nds) =>
        nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...patch } } : n))
      ),
    [setNodes]
  );

  const clearAll = useCallback(() => {
    setNodes([]);
    setEdges([]);
    idRef.current = 1;
  }, [setNodes, setEdges]);

  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onReconnectStart,
    onReconnect,
    onReconnectEnd,
    renameNode,
    deleteById,
    addNodeAt,
    setGraph,
    clearAll,
  };
}

/* ----------------------- Public Component ---------------------- */
export default function MindMapFlow({
  data,                 // { title, children? }
  xGap = 260,           // base horizontal gap
  yGap = 110,           // vertical gap
  xGrowth = 0.35,       // extra horizontal spread per depth (0.35 => 35% per level)
  maxVisibleDepth = 3,  // collapse nodes deeper than this into a placeholder
  style,
}) {
  const containerRef = useRef(null);

  // inject dark theme once
  useEffect(() => {
    const id = "reactflow-dark-theme";
    if (!document.getElementById(id)) {
      const styleEl = document.createElement("style");
      styleEl.id = id;
      styleEl.textContent = darkThemeStyles;
      document.head.appendChild(styleEl);
    }
  }, []);

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%", ...(style || {}) }}>
      <ReactFlowProvider>
        <InnerCanvas
          containerRef={containerRef}
          data={data}
          xGap={xGap}
          yGap={yGap}
          xGrowth={xGrowth}
          maxVisibleDepth={maxVisibleDepth}
        />
      </ReactFlowProvider>
    </div>
  );
}

/* -------------------------- Canvas ----------------------------- */
function InnerCanvas({ containerRef, data, xGap, yGap, xGrowth, maxVisibleDepth }) {
  // small starter graph when no JSON
  const initialNodes = useMemo(
    () =>
      data
        ? []
        : [
            { id: "a", type: "card", position: { x: 0, y: 0 }, data: { label: "Alpha" } },
            { id: "b", type: "card", position: { x: 260, y: 110 }, data: { label: "Beta" } },
          ],
    [data]
  );
  const initialEdges = useMemo(
    () => (data ? [] : [{ id: "e-a-b", source: "a", target: "b", animated: true }]),
    [data]
  );

  const actions = useFlowActions(initialNodes, initialEdges);
  const { fitView, screenToFlowPosition, getNodes } = useReactFlow();

  // state: which collapsed paths are expanded (e.g., "p:0-2-1")
  const [expanded, setExpanded] = useState(() => new Set());

  // build-time helpers
  const xAt = useCallback(
    (depth) => depth * xGap * (1 + depth * xGrowth),
    [xGap, xGrowth]
  );

  // bind node API into data
  const nodesWithAPI = useMemo(
    () =>
      actions.nodes.map((n) => ({
        ...n,
        data: {
          ...n.data,
          onChange: actions.renameNode,
          onDelete: actions.deleteById,
        },
      })),
    [actions.nodes, actions.renameNode, actions.deleteById]
  );

  // robust FIT-ALL
  const fitAll = useCallback(
    (duration = 300) => {
      const ids = getNodes().map((n) => ({ id: n.id }));
      if (!ids.length) return;
      fitView({
        nodes: ids,
        padding: 0.18,
        includeHiddenNodes: true,
        duration,
      });
    },
    [fitView, getNodes]
  );

  // responsive fit on mount & container resize
  useEffect(() => {
    const fit = () => fitAll(300);
    fit();
    const ro = new ResizeObserver(() => fitAll(200));
    if (containerRef?.current) ro.observe(containerRef.current);
    const onWin = () => fitAll(0);
    window.addEventListener("resize", onWin, { passive: true });
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", onWin);
    };
  }, [fitAll, containerRef]);

  // ---- JSON -> graph builder with collapsing ----
  const buildGraphFromJson = useCallback(
    (tree, expandedPaths) => {
      const nodes = [];
      const edges = [];
      const row = { v: 0 };

      const PATH = (arr) => `p:${arr.join("-")}`;

      const addCollapsed = (pathArr, parentId, depth, hiddenCount, label) => {
        const id = PATH(pathArr) + ":collapsed";
        nodes.push({
          id,
          type: "card",
          position: { x: xAt(depth), y: row.v * yGap },
          data: {
            label: `${label}  (+${hiddenCount} more)`,
            collapsed: true,
            onExpand: () => {
              setExpanded((prev) => {
                const next = new Set(prev);
                next.add(PATH(pathArr));
                return next;
              });
            },
          },
        });
        if (parentId) {
          edges.push({ id: `${parentId}-${id}`, source: parentId, target: id, animated: false });
        }
        row.v += 1;
      };

      const countLeaves = (node) => {
        if (!node.children || node.children.length === 0) return 1;
        return node.children.reduce((acc, c) => acc + countLeaves(c), 0);
      };

      const walk = (node, pathArr = [0], depth = 0, parentId = null) => {
        const id = PATH(pathArr);
        const isExpanded = expandedPaths.has(id);
        const willCollapse = depth >= maxVisibleDepth && !isExpanded;
        const pos = { x: xAt(depth), y: row.v * yGap };

        if (willCollapse && node.children && node.children.length > 0) {
          // collapse this entire subtree under a placeholder (keep label of current node)
          const hiddenCount = countLeaves(node);
          addCollapsed(pathArr, parentId, depth, hiddenCount, node.title || "Group");
          return;
        }

        // real node
        nodes.push({
          id,
          type: "card",
          position: pos,
          data: {
            label: node.title || "Untitled",
            onExpand: () => {
              setExpanded((prev) => {
                const next = new Set(prev);
                next.add(id);
                return next;
              });
            },
          },
        });
        if (parentId) {
          edges.push({ id: `${parentId}-${id}`, source: parentId, target: id, animated: false });
        }
        row.v += 1;

        if (node.children && node.children.length) {
          node.children.forEach((child, i) => {
            walk(child, [...pathArr, i], depth + 1, id);
          });
        }
      };

      walk(tree, [0], 0, null);
      return { nodes, edges };
    },
    [xAt, yGap, maxVisibleDepth]
  );

  // rebuild graph when data / expanded changes
  const dataKey = useMemo(() => JSON.stringify(data ?? null), [data]);

  useEffect(() => {
    if (!data) return;
    const { nodes, edges } = buildGraphFromJson(data, expanded);
    actions.setGraph(
      // add NodeCard API hooks
      nodes.map((n) => ({
        ...n,
        data: {
          ...n.data,
          onChange: actions.renameNode,
          onDelete: actions.deleteById,
        },
      })),
      edges
    );
    setTimeout(() => fitAll(300), 0);
  }, [dataKey, expanded, buildGraphFromJson, actions, fitAll]);

  // dblclick / dbltap to add free nodes
  const lastTapRef = useRef({ t: 0, x: 0, y: 0 });
  
  const onPaneDoubleClick = useCallback(
    (evt) => {
      const pos = screenToFlowPosition({ x: evt.clientX, y: evt.clientY });
      actions.addNodeAt(pos);
    },
    [screenToFlowPosition, actions]
  );
  
  const onPaneClick = useCallback(
    (evt) => {
      if (typeof evt.detail === "number" && evt.detail >= 2) {
        const pos = screenToFlowPosition({ x: evt.clientX, y: evt.clientY });
        actions.addNodeAt(pos);
        lastTapRef.current = { t: 0, x: 0, y: 0 };
        return;
      }
      const now = Date.now();
      const { t, x, y } = lastTapRef.current;
      const dx = evt.clientX - x;
      const dy = evt.clientY - y;
      const dist2 = dx * dx + dy * dy;
      if (now - t < 300 && dist2 < 24 * 24) {
        const pos = screenToFlowPosition({ x: evt.clientX, y: evt.clientY });
        actions.addNodeAt(pos);
        lastTapRef.current = { t: 0, x: 0, y: 0 };
      } else {
        lastTapRef.current = { t: now, x: evt.clientX, y: evt.clientY };
      }
    },
    [screenToFlowPosition, actions]
  );

  const nodeTypes = useMemo(() => ({ card: NodeCard }), []);

  return (
    <ReactFlow
      nodes={nodesWithAPI}
      edges={actions.edges}
      onNodesChange={actions.onNodesChange}
      onEdgesChange={actions.onEdgesChange}
      onConnect={actions.onConnect}
      onReconnectStart={actions.onReconnectStart}
      onReconnect={actions.onReconnect}
      onReconnectEnd={actions.onReconnectEnd}
      nodeTypes={nodeTypes}
      fitView
      fitViewOptions={{ padding: 0.18, includeHiddenNodes: true }}
      onPaneClick={onPaneClick}
      onPaneDoubleClick={onPaneDoubleClick}
      nodesDraggable
      nodesConnectable
      edgesFocusable
      edgesUpdatable
      deleteKeyCode={["Backspace", "Delete"]}
      proOptions={{ hideAttribution: true }}
      minZoom={0.02}
      maxZoom={2}
      style={{ width: "100%", height: "100%" }}
    >
      <Controls />
      <Background variant="dots" gap={20} size={1} color="#333" />
      <Panel position="top-left" className="space-x-2">
        <button
          onClick={() => fitAll(300)}
          className="px-3 py-1 border border-gray-600 rounded bg-gray-800 text-white hover:bg-gray-700"
        >
          Fit
        </button>
        <button
          onClick={actions.clearAll}
          className="px-3 py-1 border border-gray-600 rounded bg-gray-800 text-white hover:bg-gray-700"
        >
          Clear
        </button>
      </Panel>
    </ReactFlow>
  );
}
