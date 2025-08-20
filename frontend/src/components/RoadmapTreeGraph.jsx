// NodeLinkGraphDemo.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";

/* =========================================================
   NodeLinkGraph component (force-directed)
   ---------------------------------------------------------
   JSON schema:
   {
     nodes: [
       { id: "tsk-1", title: "Do X", owner: "Team", priority: "high|med|low", status: "open|in_progress|done", dueDate?: "YYYY-MM-DD" }
     ],
     links: [
       { source: "tsk-1", target: "tsk-2", type: "depends_on|relates_to|blocks" }
     ]
   }
========================================================= */

const PRIORITY_COLOR = {
  high: "rgba(255,86,86,0.95)",
  med: "rgba(255,190,90,0.95)",
  low: "rgba(120,220,160,0.95)",
};

const STATUS_STROKE = {
  open: "rgba(255,255,255,0.35)",
  in_progress: "rgba(65,105,225,0.85)", // royal blue
  done: "rgba(120,220,160,0.9)",
};

function colorFor(node) {
  return PRIORITY_COLOR[node.priority] || "rgba(180,200,255,0.95)";
}
function strokeFor(node) {
  return STATUS_STROKE[node.status] || "rgba(255,255,255,0.25)";
}

export function NodeLinkGraph({
  data,
  height = 460,
  nodeRadius = 10,
  charge = -260,
  linkDistance = 80,
  collide = 26,
  showLabels = true,
  onNodeClick,
  id = "graph",
  className = "",
}) {
  const svgRef = useRef(null);
  const gRef = useRef(null);
  const simRef = useRef(null);
  const [hovered, setHovered] = useState(null);
  const [selected, setSelected] = useState(null);

  const nodes = useMemo(() => (data?.nodes ?? []).map((d) => ({ ...d })), [data?.nodes]);
  const links = useMemo(() => (data?.links ?? []).map((l) => ({ ...l })), [data?.links]);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const container = d3.select(gRef.current);

    // Clear previous render (IMPORTANT: clear only the container, not the <g ref> wrapper)
    container.selectAll("*").remove();
    // Remove old defs to avoid duplicates on re-renders
    svg.select("defs").remove();

    // Responsive width (with fallback if parent hasn't sized yet)
    const bbox = svg.node().getBoundingClientRect();
    const w = bbox.width || svgRef.current.parentElement?.clientWidth || 800;
    svg.attr("viewBox", [0, 0, w, height]).attr("role", "img");

    // Zoom / Pan
    const zoom = d3.zoom().scaleExtent([0.3, 2.5]).on("zoom", (e) => container.attr("transform", e.transform));
    svg.call(zoom).on("dblclick.zoom", null);

    // Defs: glow
    const defs = svg.append("defs");
    defs
      .append("filter")
      .attr("id", `${id}-glow`)
      .append("feDropShadow")
      .attr("dx", 0)
      .attr("dy", 0)
      .attr("stdDeviation", 6)
      .attr("flood-color", "rgba(65,105,225,0.85)")
      .attr("flood-opacity", 0.7);

    // Layers
    const linkLayer = container.append("g");
    const nodeLayer = container.append("g");
    const labelLayer = container.append("g").style("pointerEvents", "none");

    // Links
    const link = linkLayer
      .attr("stroke", "rgba(255,255,255,0.18)")
      .attr("stroke-width", 1.2)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("data-type", (d) => d.type);

    // Nodes
    const node = nodeLayer
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("r", nodeRadius)
      .attr("fill", (d) => colorFor(d))
      .attr("stroke", (d) => strokeFor(d))
      .attr("stroke-width", 1.6)
      .style("cursor", "pointer")
      .on("mouseenter", (_, d) => setHovered(d.id))
      .on("mouseleave", () => setHovered(null))
      .on("click", (_, d) => {
        setSelected((prev) => (prev === d.id ? null : d.id));
        onNodeClick?.(d);
      });

    // Labels
    const label = labelLayer
      .style("fontFamily", "ui-sans-serif, system-ui")
      .style("fontSize", "11px")
      .selectAll("text")
      .data(nodes)
      .join("text")
      .attr("fill", "rgba(255,255,255,0.9)")
      .attr("stroke", "rgba(0,0,0,0.35)")
      .attr("stroke-width", 2)
      .attr("paint-order", "stroke")
      .text((d) => (showLabels ? d.title : ""));

    // Drag
    node.call(
      d3
        .drag()
        .on("start", (e, d) => {
          if (!e.active) simRef.current.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on("drag", (e, d) => {
          d.fx = e.x;
          d.fy = e.y;
        })
        .on("end", (e, d) => {
          if (!e.active) simRef.current.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        })
    );

    // Simulation
    simRef.current?.stop();
    simRef.current = d3
      .forceSimulation(nodes)
      .force("link", d3.forceLink(links).id((d) => d.id).distance(linkDistance).strength(0.6))
      .force("charge", d3.forceManyBody().strength(charge))
      .force("center", d3.forceCenter(w / 2, height / 2))
      .force("collide", d3.forceCollide(collide))
      .on("tick", ticked);

    function ticked() {
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

      node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
      label.attr("x", (d) => d.x + nodeRadius + 6).attr("y", (d) => d.y + 4);

      // focus styles
      node.attr("filter", (d) =>
        d.id === hovered || d.id === selected ? `url(#${id}-glow)` : null
      );
      link.attr("stroke-opacity", (d) => {
        if (!hovered && !selected) return 0.25;
        const focus = hovered || selected;
        return d.source.id === focus || d.target.id === focus ? 0.7 : 0.08;
      });
      label.attr("opacity", (d) => {
        if (!hovered && !selected) return 0.95;
        const focus = hovered || selected;
        const isNeighbor =
          links.some((l) => (l.source.id || l.source) === focus && (l.target.id || l.target) === d.id) ||
          links.some((l) => (l.target.id || l.target) === focus && (l.source.id || l.source) === d.id);
        return d.id === focus || isNeighbor ? 1 : 0.15;
      });
    }

    // Cleanup
    return () => {
      simRef.current?.stop();
      svg.selectAll("*").remove();
    };
  }, [nodes, links, height, nodeRadius, charge, linkDistance, collide, id, showLabels]);

  // Legend
  const legendItems = [
    { label: "High", color: PRIORITY_COLOR.high },
    { label: "Medium", color: PRIORITY_COLOR.med },
    { label: "Low", color: PRIORITY_COLOR.low },
  ];

  return (
    <div className={`relative rounded-2xl border border-white/10 bg-white/[0.035] p-4 backdrop-blur ${className}`}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="text-sm text-white/70">
          Node-link diagram — <span className="text-white/90">Action items</span> & relationships
        </div>
        <div className="flex items-center gap-3">
          {legendItems.map((it) => (
            <div key={it.label} className="flex items-center gap-2 text-xs text-white/70">
              <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: it.color }} />
              {it.label}
            </div>
          ))}
        </div>
      </div>

      <svg ref={svgRef} className="h-[460px] w-full select-none">
        <g ref={gRef} />
      </svg>

      <p className="mt-2 text-[11px] text-white/45">Scroll to zoom. Drag to pan. Drag nodes to adjust.</p>
    </div>
  );
}

/* =========================================================
   Demo usage (landing page example)
========================================================= */

const demoGraph = {
  nodes: [
    { id: "tsk-1", title: "Verify board attendance (11/12)", owner: "Investigations", priority: "high", status: "in_progress", dueDate: "2025-08-25" },
    { id: "tsk-2", title: "Request badge logs via FOIA", owner: "Records", priority: "med", status: "open" },
    { id: "tsk-3", title: "Cross-check press photos", owner: "Media", priority: "low", status: "open" },
    { id: "tsk-4", title: "Compile research brief v1", owner: "Desk", priority: "med", status: "open" },
    { id: "tsk-5", title: "Interview attendee sources", owner: "Field", priority: "high", status: "open" },
  ],
  links: [
    { source: "tsk-1", target: "tsk-2", type: "depends_on" },
    { source: "tsk-1", target: "tsk-3", type: "relates_to" },
    { source: "tsk-4", target: "tsk-1", type: "blocks" },
    { source: "tsk-5", target: "tsk-1", type: "relates_to" },
    { source: "tsk-4", target: "tsk-3", type: "depends_on" },
  ],
};

export function NodeLinkGraphDemo() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16 md:py-24">
      <h3 className="mb-2 text-center text-2xl font-semibold text-white md:text-3xl">
        See how actions connect.
      </h3>
      <p className="mx-auto mb-6 max-w-2xl text-center text-sm text-white/70">
        Every node is an actionable item. Edges show dependencies and relationships.
      </p>
      <NodeLinkGraph
        id="landing-graph"
        data={demoGraph}
        className="mt-2"
        onNodeClick={(n) => console.log("clicked:", n)}
      />
    </section>
  );
}

/* =========================================================
   Hierarchical Roadmap Tree (top-down, reactive, collapsible)
   - Vertical top→down tree using d3.tree()
   - Royal-blue chrome
   - Hover glow + click to collapse/expand (reactive)
   - Zoom/pan + keyboard focusability
   - Dynamic text wrapping + card height (no overflow)
   - Smooth snap-to-center when collapsing a parent
   - NEW: rotating disclosure chevron for nodes with children
========================================================= */

export function RoadmapTreeGraph({
  data,
  id = "roadmap-tree",
  node = { width: 200, height: 48, rx: 10 },
  siblingGap = 1.2, // separation multiplier between siblings
  onNodeClick,
  className = "",
  height = 560,
}) {
  const svgRef = React.useRef(null);
  const gRef = React.useRef(null);

  // text wrap util: wraps and vertically centers lines
  function wrapText(textSel, str, width) {
    const lineHeight = 1.3; // em
    textSel.each(function () {
      const text = d3.select(this);
      text.text(null);
      const words = String(str || "").split(/\s+/).filter(Boolean);
      let line = [];
      let tspan = text.append("tspan").attr("x", 0).attr("dy", "0em");
      for (let i = 0; i < words.length; i++) {
        line.push(words[i]);
        tspan.text(line.join(" "));
        if (tspan.node().getComputedTextLength() > width) {
          line.pop();
          tspan.text(line.join(" "));
          line = [words[i]];
          tspan = text.append("tspan").attr("x", 0).attr("dy", `${lineHeight}em`).text(words[i]);
        }
      }
      // center vertically
      const tspans = text.selectAll("tspan");
      const n = tspans.size();
      if (n > 1) {
        const totalHeight = (n - 1) * lineHeight;
        tspans.each(function (_, i) {
          d3.select(this).attr("dy", i === 0 ? `-${totalHeight / 2}em` : `${lineHeight}em`);
        });
      }
    });
  }

  React.useEffect(() => {
    if (!data || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const container = d3.select(gRef.current);

    // clear and prep
    container.selectAll("*").remove();
    svg.select("defs").remove();

    const bbox = svg.node().getBoundingClientRect();
    const w = bbox.width || svgRef.current.parentElement?.clientWidth || 900;
    svg.attr("viewBox", [0, 0, w, height]).attr("role", "img");

    // zoom/pan - mobile friendly
    const zoom = d3.zoom()
      .scaleExtent([0.5, 2.4])
      .filter((event) => {
        if (event.type === 'wheel') return event.ctrlKey || event.metaKey;
        if (event.type === 'touchstart') return event.touches.length > 1;
        return event.type === 'mousedown';
      })
      .on("zoom", (e) => container.attr("transform", e.transform));

    svg.call(zoom).on("dblclick.zoom", null);

    const getZoomTransform = () => d3.zoomTransform(svg.node());

    // defs: gradient + shadow + glow
    const defs = svg.append("defs");
    const grad = defs.append("linearGradient").attr("id", `${id}-royal`).attr("x1", "0").attr("x2", "1");
    grad.append("stop").attr("offset", "0%").attr("stop-color", "#4b68ff");
    grad.append("stop").attr("offset", "100%").attr("stop-color", "#4be3ff");

    const shadow = defs
      .append("filter")
      .attr("id", `${id}-shadow`)
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%");
    shadow
      .append("feDropShadow")
      .attr("dx", 0)
      .attr("dy", 2)
      .attr("stdDeviation", 3)
      .attr("flood-color", "rgba(65,105,225,0.6)")
      .attr("flood-opacity", 0.6);

    defs
      .append("filter")
      .attr("id", `${id}-glow`)
      .append("feDropShadow")
      .attr("dx", 0)
      .attr("dy", 0)
      .attr("stdDeviation", 6)
      .attr("flood-color", "rgba(65,105,225,0.9)")
      .attr("flood-opacity", 0.75);

    // deep clone so d3 can mutate
    const cloned = JSON.parse(JSON.stringify(data));
    const root = d3.hierarchy(cloned);

    // estimate max node height
    const innerW = node.width - 24;
    const charW = 6.5;
    const charsPerLine = Math.max(8, Math.floor(innerW / charW));
    const estLineH = 15;
    let maxH = node.height;
    root.each((d) => {
      const s = String(d.data?.title || "");
      const estLines = Math.ceil(s.length / charsPerLine);
      const estTextH = estLines * estLineH;
      const estBoxH = Math.max(node.height, estTextH + 16);
      d._box = { w: node.width, h: estBoxH };
      if (estBoxH > maxH) maxH = estBoxH;
    });

    // layout helpers (TOP-DOWN)
    const dy = node.width + 80; // column width
    const dx = maxH + 36;       // row height
    const tree = d3.tree().nodeSize([dx, dy]).separation((a, b) => (a.parent === b.parent ? siblingGap : siblingGap + 0.4));

    // initialize collapse from flags + auto-collapse deep branches if too many nodes
    let totalVisibleNodes = 0;
    root.each(() => totalVisibleNodes++);
    
    root.each((d) => {
      if (d.data && d.data.collapsed && d.children) {
        d._children = d.children;
        d.children = null;
      }
    });

    // Auto-collapse strategy: if more than 15 nodes, collapse nodes at depth 3+
    if (totalVisibleNodes > 15) {
      root.each((d) => {
        if (d.depth >= 3 && d.children && d.children.length > 0) {
          d._children = d.children;
          d.children = null;
        }
      });
    }

    // If still too many, collapse at depth 2+
    totalVisibleNodes = 0;
    root.each(() => totalVisibleNodes++);
    if (totalVisibleNodes > 15) {
      root.each((d) => {
        if (d.depth >= 2 && d.children && d.children.length > 0) {
          d._children = d.children;
          d.children = null;
        }
      });
    }

    root.x0 = 0;
    root.y0 = 0;

    const rootLayer = container.append("g").attr("transform", `translate(40,20)`);
    const linkLayer = rootLayer.append("g").attr("class", "links");
    const nodeLayer = rootLayer.append("g").attr("class", "nodes");
    let i = 0;

    // Link path helpers
    const makeLink = d3.linkHorizontal().x((d) => d.y).y((d) => d.x);
    const halfBox = (nd) => ((nd && nd._box ? nd._box.h : node.height) / 2);
    const elbow = (d) => {
      // Use target positions for smooth link transitions during layout changes
      const sourceX = d.source._targetX !== undefined ? d.source._targetX : d.source.x;
      const sourceY = d.source._targetY !== undefined ? d.source._targetY : d.source.y;
      const targetX = d.target._targetX !== undefined ? d.target._targetX : d.target.x;
      const targetY = d.target._targetY !== undefined ? d.target._targetY : d.target.y;
      
      return makeLink({
        source: { x: sourceX + halfBox(d.source), y: sourceY },
        target: { x: targetX - halfBox(d.target), y: targetY },
      });
    };
    const collapsedAt = (s) =>
      makeLink({
        source: { x: s.x0 + halfBox(s), y: s.y0 },
        target: { x: s.x0 + halfBox(s), y: s.y0 },
      });

    // helper: smooth-center on a (x,y) node position
    function smoothCenterOn(nodeDatum, opts = {}) {
      const { k: currentK } = getZoomTransform();
      const k = Math.min(Math.max(currentK, 0.8), 1.1); // clamp
      // compute dynamic vertical offset from latest layout extents
      let xMin = Infinity, xMax = -Infinity;
      root.each((d) => { if (d.x < xMin) xMin = d.x; if (d.x > xMax) xMax = d.x; });
      const rootOffsetX = 40;      // must match rootLayer translate x
      const rootOffsetY = 20;      // base y
      const dynamicYOffset = -xMin + rootOffsetY; // must match in update()

      const targetX = nodeDatum.y;
      const targetY = nodeDatum.x;

      const tx = (w / 2) - (rootOffsetX + targetX) * k;
      const ty = (height / 2) - (dynamicYOffset + targetY) * k;

      svg.transition()
        .duration(opts.duration ?? 800)
        .ease(d3.easeCubicInOut)
        .call(zoom.transform, d3.zoomIdentity.translate(tx, ty).scale(k));
    }

    let isInitialLoad = true;
    update(root);

    function update(source, opts = {}) {
      const { centerOn = false } = opts;

      // For non-initial updates, preserve parent positions to prevent snapping
      let preservedPositions = new Map();
      
      if (!isInitialLoad) {
        // First, ensure all nodes have IDs for proper position mapping
        root.each((d) => {
          if (!d.id) d.id = ++i;
        });
        
        // Store current positions of all nodes before tree recalculation
        root.each((d) => {
          preservedPositions.set(d.id, { x: d.x, y: d.y });
        });
      }

      // compute new layout (TOP-DOWN)
      tree(root);

      // CRITICAL: Lock root node position after tree calculation if not initial load
      if (!isInitialLoad) {
        const preserved = preservedPositions.get(root.id);
        if (preserved) {
          // Always keep root at its preserved position
          root._targetX = root.x;  // Store calculated position
          root._targetY = root.y;
          root.x = preserved.x;    // Force back to preserved position
          root.y = preserved.y;
        }
      }

      // For non-initial updates, restore ALL preserved positions and animate gradually
      if (!isInitialLoad && preservedPositions.size > 0) {
        root.each((d) => {
          // Skip root since we handled it specifically above
          if (d !== root) {
            const preserved = preservedPositions.get(d.id);
            if (preserved) {
              // Store the calculated target position
              d._targetX = d.x;
              d._targetY = d.y;
              // Restore the preserved position for smooth transition
              d.x = preserved.x;
              d.y = preserved.y;
            }
          }
        });
      }

      // Mark that initial load is complete
      isInitialLoad = false;

      // center vertically according to content extents (use target positions when available)
      let x0 = Infinity, x1 = -Infinity;
      root.each((d) => { 
        const checkX = d._targetX !== undefined ? d._targetX : d.x;
        if (checkX < x0) x0 = checkX; 
        if (checkX > x1) x1 = checkX; 
      });
      const offsetY = 0;
      const dynamicYOffset = offsetY - x0 + 20; // reused by chevron position animation

      const nodes = root.descendants().reverse();
      const links = root.links();

      // ids and depth spacing
      nodes.forEach((d) => {
        // IDs are already assigned during position preservation, but ensure for new nodes
        if (!d.id) d.id = ++i;
        d.y = d.depth * dy;
      });

      // NODES
      const nodeSel = nodeLayer.selectAll("g.node").data(nodes, (d) => d.id);

      const nodeEnter = nodeSel
        .enter()
        .append("g")
        .attr("class", "node")
        .attr("transform", () => `translate(${source.y0},${source.x0})`)
        .style("cursor", "pointer")
        .style("opacity", 0)
        .on("click", (_, d) => {
          const isCollapsing = !!d.children && d.children.length > 0;
          // toggle
          if (d.children) { d._children = d.children; d.children = null; }
          else { d.children = d._children; d._children = null; }
          onNodeClick?.(d.data);
          // Let the smooth position interpolation handle the movement instead of smoothCenterOn
          update(d, { centerOn: false });
        })
        .on("mouseenter", function () {
          d3.select(this).select("rect").attr("filter", `url(#${id}-glow)`);
          // Enhance chevron on hover - brighten the royal blue background
          d3.select(this).select("g.disclosure circle")
            .transition()
            .duration(200)
            .attr("fill", "#6B82FF")
            .attr("stroke-width", 2);
          d3.select(this).select("g.disclosure path")
            .transition()
            .duration(200)
            .attr("fill", "#ffffff");
        })
        .on("mouseleave", function () {
          d3.select(this).select("rect").attr("filter", `url(#${id}-shadow)`);
          // Reset chevron on mouse leave
          d3.select(this).select("g.disclosure circle")
            .transition()
            .duration(200)
            .attr("fill", "#4b68ff")
            .attr("stroke-width", 1.5);
          d3.select(this).select("g.disclosure path")
            .transition()
            .duration(200)
            .attr("fill", "#ffffff");
        });

      const rectEnter = nodeEnter
        .append("rect")
        .attr("x", -node.width / 2)
        .attr("y", -node.height / 2)
        .attr("width", node.width)
        .attr("height", node.height)
        .attr("rx", node.rx)
        .attr("fill", "#1b1f2a")
        .attr("stroke", `url(#${id}-royal)`)
        .attr("stroke-width", 1.5)
        .attr("filter", `url(#${id}-shadow)`);

      const textEnter = nodeEnter
        .append("text")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .style("font-family", "ui-sans-serif, system-ui")
        .style("font-size", "11px")
        .style("font-weight", "500")
        .style("fill", "#fff")
        .style("user-select", "none");

      // wrap and adjust box height
      textEnter.each(function (d) {
        wrapText(d3.select(this), d.data.title, node.width - 24);
        const bb = this.getBBox();
        const actualH = Math.max(node.height, bb.height + 16);
        d._box = { w: node.width, h: actualH };
        d3.select(this.parentNode)
          .select("rect")
          .attr("y", -actualH / 2)
          .attr("height", actualH);
      });

      // --- Improved: disclosure chevron (on the border, overflowing). Rotates on expand/collapse ---
      const chevronEnter = nodeEnter
        .append("g")
        .attr("class", "disclosure")
        .attr("transform", `translate(${node.width / 2},0) rotate(0)`) // positioned exactly on the right border
        .style("pointer-events", "none");

      // Create a circular background that sits on the border (half outside, half inside)
      chevronEnter
        .append("circle")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", 10)
        .attr("fill", "#4b68ff")
        .attr("stroke", "#4be3ff")
        .attr("stroke-width", 1.5)
        .attr("opacity", 1);

      // White triangle icon ▶ 
      chevronEnter
        .append("path")
        .attr("d", "M -3 -4 L 4 0 L -3 4 Z") // increased size
        .attr("fill", "#ffffff")
        .attr("opacity", 1)
        .attr("stroke", "none");

      // UPDATE + ENTER
      const nodeUpdate = nodeEnter.merge(nodeSel);

      nodeUpdate
        .transition()
        .duration(800)
        .ease(d3.easeCubicInOut)
        .attr("transform", (d) => {
          // Use target positions if available, otherwise use current positions
          const finalX = d._targetX !== undefined ? d._targetX : d.x;
          const finalY = d._targetY !== undefined ? d._targetY : d.y;
          return `translate(${finalY},${finalX})`;
        })
        .style("opacity", 1)
        .on("end", function(d) {
          // After transition, commit the target positions
          if (d._targetX !== undefined) {
            d.x = d._targetX;
            d.y = d._targetY;
            delete d._targetX;
            delete d._targetY;
          }
        });

      // update chevron visibility + rotation every tick
      nodeUpdate.select("g.disclosure")
        .style("display", (d) => (d.children || d._children ? "block" : "none"))
        .transition()
        .duration(800)
        .ease(d3.easeCubicInOut)
        .attr("transform", (d) => {
          const angle = d.children ? 90 : 0; // ▼ when expanded, ▶ when collapsed
          return `translate(${node.width / 2},0) rotate(${angle})`;
        });

      // Smooth transition for the entire graph repositioning (coordinated with node movements)
      if (source === root) {
        // Initial load - set immediately to avoid conflict with zoom-to-fit
        rootLayer.attr("transform", `translate(40,${dynamicYOffset})`);
      } else {
        // DISABLED during interactions to prevent root node snapping
        // Node interaction - animate smoothly, with slight delay to coordinate with node transitions
        // rootLayer
        //   .transition()
        //   .delay(50) // Small delay to let node transitions start first
        //   .duration(750) // Slightly shorter to finish around the same time
        //   .ease(d3.easeCubicInOut)
        //   .attr("transform", `translate(40,${dynamicYOffset})`);
      }

      // EXIT
      nodeSel
        .exit()
        .transition()
        .duration(600)
        .ease(d3.easeCubicInOut)
        .attr("transform", () => `translate(${source.y},${source.x})`)
        .style("opacity", 0)
        .remove();

      // LINKS
      const linkSel = linkLayer.selectAll("path.link").data(links, (d) => d.target.id);

      const linkEnter = linkSel
        .enter()
        .append("path")
        .attr("class", "link")
        .attr("fill", "none")
        .attr("stroke", "rgba(255,255,255,0.35)")
        .attr("stroke-width", 1.6)
        .attr("stroke-linecap", "round")
        .attr("d", () => collapsedAt(source))
        .style("opacity", 0);

      linkEnter
        .merge(linkSel)
        .transition()
        .duration(800)
        .ease(d3.easeCubicInOut)
        .attr("d", elbow)
        .style("opacity", 1);

      linkSel
        .exit()
        .transition()
        .duration(600)
        .ease(d3.easeCubicInOut)
        .style("opacity", 0)
        .attr("d", () =>
          makeLink({ source: { x: source.x + halfBox(source), y: source.y }, target: { x: source.x + halfBox(source), y: source.y } })
        )
        .remove();

      // stash old positions for transitions (use target positions when available)
      root.each((d) => {
        d.x0 = d._targetX !== undefined ? d._targetX : d.x;
        d.y0 = d._targetY !== undefined ? d._targetY : d.y;
      });

      // Optional: if you still want to force-center after layout
      if (opts.centerOn && source) {
        smoothCenterOn(source, { duration: 800 });
      }

      // Zoom to fit on initial load with smooth animation
      if (source === root) {
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        nodes.forEach(d => {
          const nodeHeight = d._box ? d._box.h : node.height;
          minX = Math.min(minX, d.x - nodeHeight/2);
          maxX = Math.max(maxX, d.x + nodeHeight/2);
          minY = Math.min(minY, d.y - node.width/2);
          maxY = Math.max(maxY, d.y + node.width/2);
        });

        const rootOffsetX = 40;
        const rootOffsetY = 20;

        const padding = 40;
        const contentWidth = (maxY - minY) + padding * 2;
        const contentHeight = (maxX - minX) + padding * 2;

        const scaleX = w / contentWidth;
        const scaleY = height / contentHeight;
        const scale = Math.min(scaleX, scaleY, 0.9);

        const centerX = (minY + maxY) / 2;
        const centerY = (minX + maxX) / 2;

        const translateX = (w / 2 - centerX * scale) - rootOffsetX * scale;
        let x0min2 = Infinity;
        root.each((d) => { if (d.x < x0min2) x0min2 = d.x; });
        const dynamicYOffset2 = -x0min2 + rootOffsetY;
        const translateY = (height / 2 - centerY * scale) - dynamicYOffset2 * scale;

        const transform = d3.zoomIdentity.translate(translateX, translateY).scale(scale);
        
        // Animate the zoom-to-fit transition smoothly
        svg.transition()
          .duration(1200)
          .ease(d3.easeCubicInOut)
          .call(zoom.transform, transform);
      }
    }
  }, [data, id, node.width, node.height, node.rx, siblingGap, height]);

  return (
    <div className={`relative rounded-2xl border border-white/10 bg-white/[0.035] p-4 backdrop-blur ${className}`}>
      <svg ref={svgRef} className="h-[560px] w-full select-none">
        <g ref={gRef} />
      </svg>
      <p className="mt-2 text-[11px] text-white/45">
        CTRL/CMD + Scroll or pinch to zoom. Drag to pan. Click a node to expand/collapse.
      </p>
    </div>
  );
}

// Demo data (long labels to test wrapping)
const roadmapData = {
  title: "Arrays & Hashing",
  children: [
    { title: "Two Pointers" },
    { title: "Stack with Exceptionally Long Name To Test Wrapping Behavior" },
    {
      title: "Binary Search / Sliding / Linked List",
      children: [
        { title: "Binary Search" },
        { title: "Sliding Window" },
        { title: "Linked List" },
      ],
    },
    {
      title: "Trees",
      children: [
        { title: "Tries", collapsed: true },
        {
          title: "Heap / Priority Queue",
          children: [
            { title: "Intervals" },
            { title: "Greedy" },
          ],
        },
        {
          title: "Backtracking",
          children: [
            { title: "Graphs" },
            {
              title: "DP",
              children: [
                { title: "1-D DP" },
                { title: "2-D DP" },
                { title: "Bit Manipulation" },
                { title: "Math & Geometry" },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export function RoadmapTreeDemo() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16 md:py-24">
      <h3 className="mb-2 text-center text-2xl font-semibold text-white md:text-3xl">Structured action map</h3>
      <p className="mx-auto mb-6 max-w-2xl text-center text-sm text-white/70">
        Every node is an actionable item. Connect related tasks into a clear, readable tree.
      </p>
      <RoadmapTreeGraph data={roadmapData} />
    </section>
  );
}

// === Runtime sanity tests (lightweight) ===
function validateNodeLinkGraphSchema(sample) {
  const okNodes = Array.isArray(sample?.nodes) && sample.nodes.every((n) => typeof n.id === "string");
  const okLinks = Array.isArray(sample?.links) && sample.links.every((l) => l.source && l.target);
  if (!okNodes || !okLinks) {
    console.warn("[TEST] NodeLinkGraph schema invalid", { okNodes, okLinks, sample });
    return false;
  }
  console.log("[TEST] NodeLinkGraph schema looks good (nodes:%d, links:%d)", sample.nodes.length, sample.links.length);
  return true;
}

function validateTreeSchema(node) {
  const ok = node && typeof node.title === "string" && (!node.children || Array.isArray(node.children));
  if (!ok) {
    console.warn("[TEST] Tree schema invalid", node);
    return false;
  }
  console.log("[TEST] RoadmapTree root ok: '%s' (children:%d)", node.title, (node.children || []).length);
  return true;
}

// Run tests on demo data so you see a console confirmation
validateNodeLinkGraphSchema(demoGraph);
validateTreeSchema(roadmapData);

// Make the tree demo the default export for now
export default RoadmapTreeDemo;
