// Markmap.jsx
// Render Markdown or your MindMapFlow JSON using markmap.
// Install deps: npm i markmap-lib markmap-view markmap-toolbar d3

import React, { useEffect, useMemo, useRef } from "react";
import { Transformer } from "markmap-lib";
import { Markmap as MarkmapView, loadCSS, loadJS } from "markmap-view";
import { Toolbar } from "markmap-toolbar";
import "markmap-toolbar/dist/style.css";

// --- Convert your {title, children} JSON into Markdown for Markmap ---
function jsonToMarkdown(node, depth = 0) {
  if (!node) return "# Untitled";
  const title = (node.title || "Untitled").replace(/\n+/g, " ").trim();

  if (depth === 0) {
    let md = `# ${title}\n`;
    if (Array.isArray(node.children))
      for (const c of node.children) md += jsonToMarkdown(c, depth + 1);
    return md;
  }

  let md = `${"  ".repeat(depth - 1)}- ${title}\n`;
  if (Array.isArray(node.children))
    for (const c of node.children) md += jsonToMarkdown(c, depth + 1);
  return md;
}

function normalizeToMarkdown({ markdown, data }) {
  if (markdown && markdown.trim()) return markdown;
  if (!data) return "# Mind Map";
  const root = data.root ? data.root : data; // support {type:'mindmap',...,root} or bare
  return jsonToMarkdown(root);
}

/**
 * Props:
 * - markdown?: string
 * - data?: { title: string, children?: [...] } | { type:"mindmap", version:"1.0", root:{...} }
 * - initialExpandLevel?: number  // 1=root only, 2=root+children, -1=expand all (default 2)
 * - style?: React.CSSProperties  // parent controls sizing; we default to 100%/100%
 * - className?: string
 */
export default function Markmap({
  markdown,
  data,
  initialExpandLevel = 2,
  style,
  className,
}) {
  const svgRef = useRef(null);
  const toolbarHostRef = useRef(null);
  const mmRef = useRef(null);
  const transformerRef = useRef(null);

  const md = useMemo(() => normalizeToMarkdown({ markdown, data }), [markdown, data]);

  // Create / update markmap
  useEffect(() => {
    // Guard for SSR
    if (typeof window === "undefined") return;

    try {
      transformerRef.current ||= new Transformer();
      const transformer = transformerRef.current;

      // markdown -> tree
      const { root } = transformer.transform(md);

      // Create or update the Markmap instance (skip asset loading for now)
      const svgEl = svgRef.current;
      if (!svgEl) return;

      if (!mmRef.current) {
        mmRef.current = MarkmapView.create(svgEl, { 
          initialExpandLevel,
          colorScheme: 'dark'
        }, root);
      } else {
        mmRef.current.setOptions({ 
          initialExpandLevel,
          colorScheme: 'dark'
        });
        mmRef.current.setData(root);
        mmRef.current.fit();
      }

      // Attach toolbar once
      if (toolbarHostRef.current && toolbarHostRef.current.childElementCount === 0) {
        const toolbar = new Toolbar();
        toolbar.attach(mmRef.current);
        toolbarHostRef.current.append(toolbar.render());
      }

      // Smooth fit next frame
      requestAnimationFrame(() => {
        try { mmRef.current?.fit(); } catch {}
      });
    } catch (error) {
      console.error('An error occurred in the <Markmap> component:', error);
    }
  }, [md, initialExpandLevel]);

  // Fit on parent resize
  useEffect(() => {
    if (typeof window === "undefined") return;
    const ro = new ResizeObserver(() => {
      try { mmRef.current?.fit(); } catch {}
    });
    const host = svgRef.current?.parentElement;
    if (host) ro.observe(host);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      className={className}
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        background: "#0f0f10",
        ...(style || {}),
      }}
    >
      {/* Toolbar (top-right) */}
      <div
        ref={toolbarHostRef}
        style={{
          position: "absolute",
          right: 8,
          top: 8,
          zIndex: 10,
          background: "rgba(20,20,20,.6)",
          borderRadius: 8,
          padding: 4,
          backdropFilter: "blur(4px)",
        }}
      />
      {/* Markmap renders into this SVG */}
      <svg ref={svgRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
