// src/components/AboutSection.jsx
import React, { useRef, useState } from "react";
import { motion } from "framer-motion";

/* ----------------------- Spotlight Feature Card ----------------------- */
function SpotlightFeatureCard({
  title,
  text,
  image,
  className = "",
  spotlightColor = "rgba(65,105,225,0.40)", // royal blue
}) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);
  const [focused, setFocused] = useState(false);

  const onMove = (e) => {
    if (!ref.current || focused) return;
    const r = ref.current.getBoundingClientRect();
    setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseEnter={() => setOpacity(0.6)}
      onMouseLeave={() => setOpacity(0)}
      onFocus={() => {
        setFocused(true);
        setOpacity(0.6);
      }}
      onBlur={() => {
        setFocused(false);
        setOpacity(0);
      }}
      tabIndex={0}
      className={`relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur shadow-[0_0_0_1px_rgba(255,255,255,0.02)] ${className}`}
    >
      {/* spotlight */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-opacity duration-500 ease-in-out"
        style={{
          opacity,
          background: `radial-gradient(circle at ${pos.x}px ${pos.y}px, ${spotlightColor}, transparent 75%)`,
        }}
      />
      {/* image */}
      <div className="relative h-40 w-full overflow-hidden rounded-xl">
        <img
          src={image}
          alt=""
          className="h-full w-full object-cover opacity-90 transition duration-300"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
      </div>
      {/* copy */}
      <div className="relative mt-5">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-white/70">{text}</p>
      </div>
    </div>
  );
}

/* ----------------------------- Defaults ------------------------------ */
const defaultFeatures = [
  {
    title: "Extract Actionable Items",
    text:
      "Confused where to start? Let us help you find the most important information.",
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop",
  },
  {
    title: "Research Packs",
    text:
      "Auto‑compiled briefs with quotes, timestamps, and verifiable citations from diverse sources.",
    image:
      "https://images.unsplash.com/photo-1517433456452-f9633a875f6f?q=80&w=800&auto=format&fit=crop",
  },
  {
    title: "Knowledge Graph",
    text:
      "People, orgs, claims and evidence — connected in an explorable graph.",
    image:
      "https://images.unsplash.com/photo-1551281044-8d8d0d8d4f9b?q=80&w=800&auto=format&fit=crop",
  },
];

/* --------------------------- About Section --------------------------- */
export default function AboutSection({
  eyebrow = "About BULB",
  title = "In an age of noise, BULB is your filter for truth.",
  subtitle = "Transcripts → insights, research, and an explorable graph.",
  blurb = "We convert unstructured conversations into clear insights, factual reports, and dynamic graphs that connect the dots — all with direct source links.",
  features = defaultFeatures,
  id = "about",
}) {
  const container = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  const card = {
    hidden: { opacity: 0, y: 18, scale: 0.98 },
    show: (i) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { delay: 0.08 * i, duration: 0.45, ease: "easeOut" },
    }),
  };

  return (
    <section
      id={id}
      className="relative isolate mx-auto max-w-6xl px-6 py-20 md:py-28"
      aria-labelledby="about-heading"
    >
      {/* soft backdrop glows */}
      <div aria-hidden className="pointer-events-none absolute -inset-16 -z-10">
        <div
          className="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full blur-3xl opacity-40"
          style={{
            background:
              "radial-gradient(50% 50% at 50% 50%, rgba(65,105,225,0.25) 0%, rgba(65,105,225,0) 70%)",
          }}
        />
        <div
          className="absolute right-10 bottom-0 h-56 w-56 rounded-full blur-3xl opacity-30"
          style={{
            background:
              "radial-gradient(50% 50% at 50% 50%, rgba(0,255,200,0.18) 0%, rgba(0,255,200,0) 70%)",
          }}
        />
      </div>

      {/* header */}
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        className="mx-auto max-w-3xl text-center"
      >
        <p className="mb-3 inline-block rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium tracking-wide text-white/70 backdrop-blur">
          {eyebrow}
        </p>
        <h2 id="about-heading" className="text-2xl md:text-4xl font-semibold tracking-tight text-white">
          {title}
        </h2>
        <p className="mt-3 text-base md:text-lg text-white/70">{subtitle}</p>
        <p className="mt-6 text-sm md:text-base leading-relaxed text-white/60">
          {blurb}
        </p>
      </motion.div>

      {/* spotlight cards */}
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.slice(0, 3).map((f, i) => (
          <motion.div
            key={i}
            custom={i}
            variants={card}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            <SpotlightFeatureCard title={f.title} text={f.text} image={f.image} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
