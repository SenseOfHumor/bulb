// src/components/CallToAction.jsx
import React from "react";
import { motion } from "framer-motion";

export default function CallToAction({
  eyebrow = "Built for truth‑seekers",
  titleA = "Your transcript →",
  titleB = "action, research, graph.",
  subtitle = "Spin up a brief with citations in minutes.",
  primary = { label: "Try the Demo", href: "#demo" },
  secondary = { label: "Pricing", href: "#pricing" },
  bullets = [
    "Source‑linked statements",
    "Interactive knowledge graph",
    "Export to PDF/Markdown",
  ],
  id = "cta",
}) {
  const container = {
    hidden: { opacity: 0, y: 18 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <section
      id={id}
      className="relative isolate mx-auto max-w-6xl px-6 py-20 md:py-28"
      aria-labelledby="cta-heading"
    >
      {/* animated halo ribbon (very subtle) */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -inset-24 -z-10 opacity-50"
        initial={{ translateX: "-10%", rotate: 0 }}
        whileInView={{ translateX: "10%" }}
        transition={{ duration: 8, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
      >
        <div
          className="absolute left-1/2 top-0 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(50% 50% at 50% 50%, rgba(65,105,225,0.28) 0%, rgba(65,105,225,0) 70%)",
          }}
        />
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.35 }}
        className="mx-auto overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.045] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur md:p-12"
      >
        {/* hairline accent */}
        <div
          aria-hidden
          className="mx-auto mb-6 h-px w-24 rounded-full"
          style={{
            background:
              "linear-gradient(90deg, rgba(65,105,225,0) 0%, rgba(65,105,225,0.9) 50%, rgba(65,105,225,0) 100%)",
          }}
        />

        <div className="mx-auto max-w-2xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium tracking-wide text-white/70">
            {eyebrow}
            <span className="inline-block h-1 w-1 rounded-full bg-[rgba(65,105,225,0.9)] shadow-[0_0_10px_rgba(65,105,225,0.7)]" />
          </p>

          {/* tightened title with gradient emphasis */}
          <h2 id="cta-heading" className="mt-3 text-white">
            <span className="block text-2xl font-semibold tracking-tight md:text-[34px]/[1.15]">
              {titleA}
            </span>
            <span className="block text-[30px] font-extrabold tracking-tight md:text-[44px]">
              <span className="bg-gradient-to-r from-[#9db7ff] via-[#c7e3ff] to-[#a6ffe5] bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(65,105,225,0.35)]">
                {titleB}
              </span>
            </span>
          </h2>

          <p className="mt-3 text-[15px] text-white/75 md:text-[17px]">{subtitle}</p>

          {/* bullets with icon dots and more spacing */}
          {!!bullets?.length && (
            <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/65">
              {bullets.map((b, i) => (
                <li key={i} className="inline-flex items-center gap-2">
                  <svg width="8" height="8" viewBox="0 0 8 8" className="drop-shadow-[0_0_10px_rgba(65,105,225,0.6)]">
                    <circle cx="4" cy="4" r="4" fill="rgba(65,105,225,0.95)" />
                  </svg>
                  {b}
                </li>
              ))}
            </ul>
          )}

          {/* actions */}
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {/* gradient ring button */}
            <a href={primary.href} className="group rounded-xl bg-gradient-to-r from-[rgba(65,105,225,0.75)] to-cyan-300/70 p-[1px]">
              <span className="relative block rounded-[11px] bg-[rgba(8,12,20,0.85)] px-5 py-3 text-sm font-semibold text-white shadow-[0_0_0_1px_rgba(255,255,255,0.06)] transition hover:shadow-[0_0_24px_rgba(65,105,225,0.4)]">
                <span className="absolute inset-0 overflow-hidden rounded-[11px]">
                  <span className="absolute -inset-1 translate-x-[-120%] bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 transition duration-700 group-hover:translate-x-[120%] group-hover:opacity-100" />
                </span>
                {primary.label}
              </span>
            </a>

            <a
              href={secondary.href}
              className="rounded-xl border border-white/12 bg-white/[0.06] px-5 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/[0.1]"
            >
              {secondary.label}
            </a>
          </div>

          {/* tiny legal */}
          <p className="mt-4 text-[11px] text-white/50">No spam. Unsubscribe anytime. We respect your data.</p>
        </div>
      </motion.div>
    </section>
  );
}
