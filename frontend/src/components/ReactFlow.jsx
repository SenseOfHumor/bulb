// Modular React Flow Playground (fixed for @xyflow/react v11+)
// -------------------------------------------------------------
// What changed:
// - Removed use of `getContainer()` (not available): now uses
//   `screenToFlowPosition()` and a wrapper <div ref> for resize observing.
// - Pane-click → add node uses screen coords → flow coords directly.
// - Auto-fit uses ResizeObserver on our wrapper instead of internal container.
// - Kept all requested features: add/remove/sever/reconnect/edit titles.
// - Added optional DEV smoke tests (opt-in via window.__FLOW_TESTS__ = true).
//
// Features:
// - Add nodes: click empty canvas or use the "+ Node" button
// - Remove: select node/edge and press Delete/Backspace; or use node toolbar
// - Sever edge: start reconnecting an edge and drop on empty pane -> edge deleted
// - Reconnect edge: drag an edge endpoint onto another handle
// - Edit node title: double‑click a node, type, Enter/Escape to save/cancel
// - Responsive: auto fit on mount and when wrapper resizes
// - Modular: components and hooks defined separately below
//
// Stack: React 18+, @xyflow/react v11+
// Usage: drop this file into a React app and render <Playground />.
// Make sure to install: npm i @xyflow/react
// -------------------------------------------------------------

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
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

// Dark theme styles
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
  .react-flow__controls-button:hover {
    background: #3a3a3a !important;
  }
  .react-flow__minimap {
    background: #1a1a1a !important;
    border: 1px solid #333 !important;
  }
  .react-flow__panel {
    background: #1a1a1a !important;
    color: #fff !important;
    border: 1px solid #333 !important;
  }
  .react-flow__edge-text {
    fill: #fff !important;
  }
  .react-flow__node {
    color: #fff !important;
  }
`;

/* =========================================
   NodeCard (custom node)
   - shows title
   - inline edit on double click (or pencil button)
   - four handles for connections
   - toolbar with delete
========================================= */
function NodeCard({ id, data, selected }) {
  const [editing, setEditing] = useState(false);
  const [temp, setTemp] = useState(data.label || "Untitled");

  // commit change using callback passed from parent via data.onChange
  const commit = useCallback(() => {
    const cleaned = temp.trim() || "Untitled";
    data.onChange?.(id, { label: cleaned });
    setEditing(false);
  }, [id, temp, data]);

  // cancel edit
  const cancel = useCallback(() => {
    setTemp(data.label || "Untitled");
    setEditing(false);
  }, [data.label]);

  return (
    <div
      onDoubleClick={() => setEditing(true)}
      className={`rounded-2xl shadow-md border ${
        selected ? "border-blue-500" : "border-zinc-300"
      } bg-white text-zinc-900 min-w-[160px] max-w-[240px]`}
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

      {/* handles */}
      <Handle type="source" position={Position.Top} />
      <Handle type="source" position={Position.Right} />
      <Handle type="target" position={Position.Left} />
      <Handle type="target" position={Position.Bottom} />
    </div>
  );
}

/* =========================================
   Hook: useFlowActions
   - encapsulates nodes/edges state & action creators
   - add/remove nodes, connect, sever/reconnect edges, rename
========================================= */
function useFlowActions(initialNodes = [], initialEdges = []) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const rf = useReactFlow();

  const idRef = useRef(1);

  const addNodeAt = useCallback(
    (pos) => {
      const id = `n${idRef.current++}`;
      setNodes((nds) =>
        nds.concat({
          id,
          type: "card",
          position: pos,
          data: { label: `Node ${id}` },
        })
      );
      // focus/fit if needed
      requestAnimationFrame(() => rf.fitView({ padding: 0.2, duration: 200 }));
      return id;
    },
    [rf, setNodes]
  );

  // Convenience helper if you only have screen coordinates
  const addNodeFromScreenXY = useCallback(
    (clientX, clientY) => {
      const { screenToFlowPosition } = rf;
      const flowPos = screenToFlowPosition({ x: clientX, y: clientY });
      return addNodeAt(flowPos);
    },
    [rf, addNodeAt]
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

  // Edge reconnection/severing
  const reconnectOk = useRef(true);
  const reconnectingEdgeId = useRef(null);

  const onReconnectStart = useCallback((_, edge) => {
    reconnectOk.current = false;
    reconnectingEdgeId.current = edge?.id ?? null;
  }, []);

  const onReconnect = useCallback(
    (oldEdge, newConn) => {
      reconnectOk.current = true; // a valid target was found
      setEdges((eds) => reconnectEdge(oldEdge, newConn, eds));
    },
    [setEdges]
  );

  const onReconnectEnd = useCallback(
    () => {
      // if user released on canvas (no valid handle), sever/delete
      if (!reconnectOk.current && reconnectingEdgeId.current) {
        const victim = reconnectingEdgeId.current;
        setEdges((eds) => eds.filter((e) => e.id !== victim));
      }
      reconnectOk.current = true;
      reconnectingEdgeId.current = null;
    },
    [setEdges]
  );

  const renameNode = useCallback(
    (id, patch) =>
      setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...patch } } : n))),
    [setNodes]
  );

  const clearAll = useCallback(() => {
    setNodes([]);
    setEdges([]);
  }, [setNodes, setEdges]);

  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    addNodeAt,
    addNodeFromScreenXY,
    deleteById,
    onConnect,
    onReconnectStart,
    onReconnect,
    onReconnectEnd,
    renameNode,
    clearAll,
  };
}

/* =========================================
   FlowCanvas
   - wires up ReactFlow with our actions
   - panel buttons + instructions
========================================= */
function FlowCanvas({ wrapperRef }) {
  // Inject dark theme styles
  useEffect(() => {
    const styleId = 'reactflow-dark-theme';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = darkThemeStyles;
      document.head.appendChild(style);
    }
    return () => {
      const existingStyle = document.getElementById(styleId);
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);

  const initialNodes = useMemo(
    () => [
      { id: "a", type: "card", position: { x: 0, y: 0 }, data: { label: "Alpha" } },
      { id: "b", type: "card", position: { x: 240, y: 120 }, data: { label: "Beta" } },
    ],
    []
  );
  const initialEdges = useMemo(() => [{ id: "e-a-b", source: "a", target: "b", animated: true }], []);

  const actions = useFlowActions(initialNodes, initialEdges);
  const { fitView, screenToFlowPosition } = useReactFlow();

  // supply callbacks into node data
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

  // auto-fit on mount and when wrapper resizes
  useEffect(() => {
    fitView({ padding: 0.2, duration: 300 });
    const ro = new ResizeObserver(() => fitView({ padding: 0.2, duration: 300 }));
    const el = wrapperRef?.current;
    if (el) ro.observe(el);
    window.addEventListener("resize", onWindowResize, { passive: true });
    function onWindowResize() {
      fitView({ padding: 0.2, duration: 0 });
    }
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", onWindowResize);
    };
  }, [fitView, wrapperRef]);

  // click-to-add on empty canvas
  const onPaneClick = useCallback(
    (evt) => {
      const pos = screenToFlowPosition({ x: evt.clientX, y: evt.clientY });
      actions.addNodeAt(pos);
    },
    [screenToFlowPosition, actions]
  );

  const nodeTypes = useMemo(() => ({ card: NodeCard }), []);

  // ---- DEV Smoke Tests (opt-in) ----
  useEffect(() => {
    if (!window.__FLOW_TESTS__) return;

    const delay = (ms) => new Promise((r) => setTimeout(r, ms));
    (async () => {
      console.info("[FLOW TEST] starting smoke tests");
      const id = actions.addNodeAt({ x: 400, y: 80 });
      await delay(10);
      actions.onConnect({ source: "a", target: id });
      await delay(10);
      console.assert(actions.edges.some((e) => e.source === "a" && e.target === id), "edge should exist");
      // simulate sever: mark reconnection started but not finished on a handle => remove
      actions.onReconnectStart(null, actions.edges.find((e) => e.source === "a" && e.target === id));
      actions.onReconnectEnd();
      await delay(10);
      console.assert(!actions.edges.some((e) => e.source === "a" && e.target === id), "edge should be removed");
      console.info("[FLOW TEST] finished");
    })();
  }, [actions]);

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
          onClick={() => actions.addNodeAt({ x: Math.random() * 300, y: Math.random() * 200 })}
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

/* =========================================
   Playground (root component)
========================================= */
export default function Playground() {
  const wrapperRef = useRef(null);
  return (
    <div ref={wrapperRef} style={{ width: "100%", height: "100%" }}>
      <ReactFlowProvider>
        <FlowCanvas wrapperRef={wrapperRef} />
      </ReactFlowProvider>
    </div>
  );
}
