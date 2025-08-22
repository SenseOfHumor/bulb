// MindMapFlow.jsx
// -------------------------------------------------------------
// Drop-in component for @xyflow/react v11+
// - Preserves playground features & styling you asked for
// - Adds recursive JSON -> graph builder via `data` prop
//
// Props:
//   data?: { title: string; children?: Array<same>; id?: string }
//   xGap?: number  (default: 240)
//   yGap?: number  (default: 100)
// -------------------------------------------------------------

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
  .react-flow__controls {
    background: #1a1a1a !important;
    border: 1px solid #333 !important;
  }
  .react-flow__controls-button {
    background: #2a2a2a !important;
    border-bottom: 1px solid #333 !important;
    color: #fff !important;
  }
  .react-flow__controls-button:hover { background: #3a3a3a !important; }
  .react-flow__panel {
    background: #1a1a1a !important; color: #fff !important; border: 1px solid #333 !important;
  }
  .react-flow__minimap { background: #1a1a1a !important; border: 1px solid #333 !important; }
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

  return (
    <div
      onDoubleClick={() => setEditing(true)}
      className={`rounded-2xl shadow-md border ${
        selected ? "border-blue-500" : "border-zinc-300"
      } bg-white text-zinc-900 min-w-[160px] max-w-[260px]`}
      style={{ fontFamily: "Inter, ui-sans-serif, system-ui" }}
    >
      <div className="px-3 py-2 flex items-center gap-2">
        {!editing ? (
          <>
            <div className="font-medium leading-tight truncate flex-1" title={data.label}>
              {data.label || "Untitled"}
            </div>
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
      setNodes((nds) =>
        nds.concat({ id, type: "card", position: pos, data: { label } })
      );
      return id;
    },
    [setNodes]
  );

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

  // Edge reconnection (drag endpoint to another handle); if dropped on pane, XYFlow will call onReconnectEnd without valid connection -> we can keep or remove via custom flow, but here we only handle valid reconnections.
  const onReconnect = useCallback(
    (oldEdge, newConn) => setEdges((eds) => reconnectEdge(oldEdge, newConn, eds)),
    [setEdges]
  );

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
    onReconnect,
    renameNode,
    deleteById,
    addNodeAt,
    clearAll,
  };
}

/* --------------------- JSON → Graph Builder -------------------- */
/**
 * Recursively builds nodes/edges from a nested JSON:
 * { title, id?, children: [...] }
 * Layout: left -> right using simple grid (x = depth * xGap, y = row * yGap).
 * Uses a shared offset ref to stack leaves vertically in order.
 */
function useJsonBuilder(actions, xGap, yGap) {
  const idGen = useRef(0); // local id if JSON lacks ids

  const ensureId = useCallback((json) => {
    return json.id || `json-${idGen.current++}`;
  }, []);

  const buildFromJson = useCallback(
    (json, parentId = null, depth = 0, cursor = { row: 0 }) => {
      const nodeId = ensureId(json);

      const pos = { x: depth * xGap, y: cursor.row * yGap };
      actions.addNodeAt(pos, json.title || nodeId);
      // last added node has id generated by addNodeAt; we need that id.
      // We can mirror React state by computing what the id will be:
      // addNodeAt uses id pattern n<counter>. We'll read it instead by returning from addNodeAt:
      // -> modify addNodeAt to return id; already returns id.
      const thisId = `n${Number(actions.nodes.length ? Math.max(...actions.nodes.map(n => Number(n.id?.slice(1)) || 0)) : 0) + 1}`; // fallback guard
      // However relying on state length is fragile. Better approach: have addNodeAt return id and use that.
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [actions, xGap, yGap, ensureId]
  );

  // We’ll expose a safer builder below that does not guess IDs:
  const stableBuildFromJson = useCallback(
    (json) => {
      // We’ll stage building synchronously using explicit returns from addNodeAt.
      const addTree = (node, parentReactId = null, depth = 0, cursor = { row: 0 }) => {
        const reactId = actions.addNodeAt(
          { x: depth * xGap, y: cursor.row * yGap },
          node.title || "Untitled"
        );

        if (parentReactId) {
          actions.onConnect({ source: parentReactId, target: reactId });
        }

        if (node.children && node.children.length) {
          for (const child of node.children) {
            cursor.row += 1;
            addTree(child, reactId, depth + 1, cursor);
          }
        }
        return reactId;
      };

      addTree(json, null, 0, { row: 0 });
    },
    [actions, xGap, yGap]
  );

  return { buildFromJson: stableBuildFromJson };
}

/* -------------------------- Canvas ----------------------------- */
function InnerCanvas({ data, xGap, yGap }) {
  // inject theme once
  useEffect(() => {
    const id = "reactflow-dark-theme";
    if (!document.getElementById(id)) {
      const style = document.createElement("style");
      style.id = id;
      style.textContent = darkThemeStyles;
      document.head.appendChild(style);
    }
    return () => {
      // keep style persistent across mounts in the app; remove if you prefer cleanup:
      // const s = document.getElementById(id);
      // if (s) s.remove();
    };
  }, []);

  const actions = useFlowActions([], []);
  const { fitView, screenToFlowPosition } = useReactFlow();
  const { buildFromJson } = useJsonBuilder(actions, xGap, yGap);

  // bind node API
  const nodesWithAPI = useMemo(
    () =>
      actions.nodes.map((n) => ({
        ...n,
        data: { ...n.data, onChange: actions.renameNode, onDelete: actions.deleteById },
      })),
    [actions.nodes, actions.renameNode, actions.deleteById]
  );

  // fit on mount & when sizes change
  useEffect(() => {
    const ro = new ResizeObserver(() => fitView({ padding: 0.2, duration: 200 }));
    ro.observe(document.body);
    fitView({ padding: 0.2, duration: 300 });
    return () => ro.disconnect();
  }, [fitView]);

  // (Re)build from JSON when `data` changes
  useEffect(() => {
    if (!data) return;
    actions.clearAll();
    buildFromJson(data);
    // allow layout to render then fit
    setTimeout(() => fitView({ padding: 0.2, duration: 300 }), 0);
  }, [data, buildFromJson, actions, fitView]);

  // pane click -> add node at click
  const onPaneClick = useCallback(
    (evt) => {
      const pos = screenToFlowPosition({ x: evt.clientX, y: evt.clientY });
      actions.addNodeAt(pos);
    },
    [actions, screenToFlowPosition]
  );

  const nodeTypes = useMemo(() => ({ card: NodeCard }), []);

  return (
    <ReactFlow
      nodes={nodesWithAPI}
      edges={actions.edges}
      onNodesChange={actions.onNodesChange}
      onEdgesChange={actions.onEdgesChange}
      onConnect={actions.onConnect}
      onReconnect={actions.onReconnect}
      nodeTypes={nodeTypes}
      fitView
      fitViewOptions={{ padding: 0.2 }}
      onPaneClick={onPaneClick}
      nodesDraggable
      nodesConnectable
      edgesFocusable
      edgesUpdatable
      deleteKeyCode={["Backspace", "Delete"]}
      proOptions={{ hideAttribution: true }}
      style={{ width: "100%", height: "100%" }}
    >
      <Controls />
      <Background variant="dots" gap={20} size={1} color="#333" />
      <Panel position="top-left" className="space-x-2">
        <button
          onClick={() => actions.addNodeAt({ x: Math.random() * 320, y: Math.random() * 220 })}
          className="px-3 py-1 border border-gray-600 rounded bg-gray-800 text-white hover:bg-gray-700"
        >
          + Node
        </button>
        <button
          onClick={() => fitView({ padding: 0.2, duration: 300 })}
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

/* ----------------------- Public Component ---------------------- */
export default function MindMapFlow({
  data,     // mind-map JSON
  xGap = 240,
  yGap = 100,
  style,
}) {
  return (
    <div style={{ width: "100vw", height: "100vh", ...(style || {}) }}>
      <ReactFlowProvider>
        <InnerCanvas data={data} xGap={xGap} yGap={yGap} />
      </ReactFlowProvider>
    </div>
  );
}
