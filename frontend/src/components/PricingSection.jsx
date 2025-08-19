// src/components/PricingSection.jsx
import React, { useRef, useState } from "react";
import { motion } from "framer-motion";

/* If you already have your SpotlightCard, delete this and import yours.
   This is a minimal local version with the royal-blue glow. */
function SpotlightCard({
  children,
  className = "",
  spotlightColor = "rgba(65,105,225,0.28)",
}) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);
  return (
    <div
      ref={ref}
      onMouseMove={(e) => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
      }}
      onMouseEnter={() => setOpacity(0.6)}
      onMouseLeave={() => setOpacity(0)}
      className={`relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b0e16] p-6 ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-500"
        style={{
          opacity,
          background: `radial-gradient(220px 220px at ${pos.x}px ${pos.y}px, ${spotlightColor}, transparent 60%)`,
        }}
      />
      {children}
    </div>
  );
}

const defaultPlans = [
  {
    id: "free",
    name: "Free",
    monthly: 0,
    annual: 0,
    badge: "start here",
    cta: "Start for free",
    features: [
      "Action list & clustering",
      "Interactive node graph (up to 150 nodes)",
      "Auto-summary & study guide",
      "Export to PDF / Markdown",
      "Public share link",
      "No research credits (upgrade to unlock)",
    ],
  },
  {
    id: "plus",
    name: "Plus",
    monthly: 10,
    annual: 8, // shown as /mo when annual is selected
    badge: "best value",
    highlighted: true,
    cta: "Get Plus",
    features: [
      "All Free features",
      "500 AI research credits / month",
      "Graph limit 1,500 nodes",
      "Source capture with direct links",
      "Export CSV / RIS / BibTeX",
      "Priority email support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    monthly: 24,
    annual: 20,
    badge: "power users",
    cta: "Get Pro",
    features: [
      "All Plus features",
      "2,500 AI research credits / month",
      "Advanced verification & link archiving",
      "Custom prompts & saved searches",
      "PII redaction tools",
      "Priority support",
    ],
  },
];

export default function PricingSection({
  plans = defaultPlans,
  currency = "USD",
  className = "",
  showToggle = true,
  eduNotice = "Generous free tier to hit the ground running",
}) {
  const [annual, setAnnual] = useState(true);

  const Price = ({ p }) => (
    <div className="mt-4 flex items-baseline gap-2">
      <span className="text-3xl font-semibold text-white">
        ${annual ? p.annual : p.monthly}
      </span>
      <span className="text-white/60 text-sm">/mo</span>
      {annual && p.monthly !== p.annual && (
        <span
          className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-white/80"
          title="Pay annually to save"
        >
          {/* tiny sparkle icon */}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M12 3l1.6 3.6L17 8.2l-3.4 1.6L12 13l-1.6-3.2L7 8.2l3.4-1.6L12 3z" fill="currentColor" />
          </svg>
          save
        </span>
      )}
    </div>
  );

  const Pill = ({ active, children, onClick, isAnnual = false }) => (
    <button
      onClick={onClick}
      className={`px-6 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
        active 
          ? isAnnual 
            ? "bg-[#4169E1] text-white shadow-lg shadow-blue-500/25" 
            : "bg-white text-black shadow-md"
          : "text-white/70 hover:text-white/90 hover:bg-white/5"
      }`}
    >
      {children}
    </button>
  );

  const TinyBadge = ({ children }) => (
    <span className="inline-flex items-center rounded-full border border-white/15 bg-white/8 px-2 py-[2px] text-[10px] uppercase tracking-wide text-white/70">
      {children}
    </span>
  );

  return (
    <section className={`mx-auto max-w-6xl px-6 py-16 md:py-24 ${className}`}>
      {/* header */}
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-semibold text-white tracking-tight">
          Simple, fair pricing for real research
        </h2>
        <p className="mt-3 text-white/70">
          comes with NewellAI for help with your research.
        </p>

        {showToggle && (
          <div className="mt-6 flex justify-center">
            <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1.5">
              <Pill active={!annual} onClick={() => setAnnual(false)}>
                Monthly
              </Pill>
              <Pill active={annual} onClick={() => setAnnual(true)} isAnnual={true}>
                Annual
                <span className="ml-1.5 align-middle inline-block">
                  <svg width="12" height="12" viewBox="0 0 24 24" className="text-current" fill="currentColor">
                    <path d="M12 3l1.6 3.6L17 8.2l-3.4 1.6L12 13l-1.6-3.2L7 8.2l3.4-1.6L12 3z" />
                  </svg>
                </span>
              </Pill>
            </div>
          </div>
        )}
      </div>

      {/* cards */}
      <div className="mt-8 grid gap-5 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((p, idx) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: 0.04 * idx, duration: 0.35 }}
          >
            <SpotlightCard className={p.highlighted ? "ring-1 ring-[#4b68ff]/50" : ""}>
              <div className="flex h-full flex-col items-start text-left">
                <div className="flex items-center justify-between w-full">
                  <h3 className="text-lg font-semibold text-white">{p.name}</h3>
                  {p.badge && <TinyBadge>{p.badge}</TinyBadge>}
                </div>

                <Price p={p} />

                <ul className="mt-4 space-y-2 text-sm text-white/80">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-[#4b68ff]" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`mt-6 w-full rounded-xl px-4 py-2 text-sm font-medium transition ${
                    p.highlighted
                      ? "bg-white text-black hover:bg-white/90"
                      : "bg-[#121625] text-white hover:bg-[#141a2b]"
                  }`}
                >
                  {p.cta || "Choose plan"}
                </button>
              </div>
            </SpotlightCard>
          </motion.div>
        ))}
      </div>

      <p className="mt-6 text-left text-xs text-white/60">
        {eduNotice}. Transactions are non-refundable and processed securely.
      </p>
    </section>
  );
}
