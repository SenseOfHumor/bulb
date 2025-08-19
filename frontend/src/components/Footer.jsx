// src/components/Footer.jsx
import React from "react";
import { motion } from "framer-motion";
import image from "/fixmynotes-ring.svg";

const fixmynotes = <img src={image} alt="Fix My Notes" />;

const cx = (...cls) => cls.filter(Boolean).join(" ");

function SocialIcon({ name = "x", className = "h-5 w-5", ...props }) {
  const common = { fill: "currentColor" };
  if (name === "github") {
    return (
      <svg viewBox="0 0 24 24" className={className} {...props}><path {...common} d="M12 2C6.48 2 2 6.58 2 12.26c0 4.5 2.87 8.32 6.85 9.67.5.09.68-.22.68-.49 0-.24-.01-.87-.01-1.71-2.78.62-3.37-1.2-3.37-1.2-.45-1.18-1.11-1.5-1.11-1.5-.91-.63.07-.62.07-.62 1 .07 1.52 1.06 1.52 1.06 .9 1.58 2.36 1.13 2.94.86.09-.67.35-1.13.64-1.39-2.22-.26-4.55-1.14-4.55-5.08 0-1.12.39-2.04 1.03-2.76-.1-.26-.45-1.33.1-2.77 0 0 .84-.27 2.75 1.05A9.23 9.23 0 0 1 12 7.1c.85 0 1.7.12 2.5.34 1.9-1.32 2.74-1.05 2.74-1.05 .55 1.44.2 2.51.1 2.77.65.72 1.03 1.64 1.03 2.76 0 3.95-2.33 4.82-4.56 5.07.36.32.68.94.68 1.9 0 1.37-.01 2.48-.01 2.82 0 .27.18.58.69.48A10.06 10.06 0 0 0 22 12.26C22 6.58 17.52 2 12 2z"/></svg>
    );
  }
  if (name === "linkedin") {
    return (
      <svg viewBox="0 0 24 24" className={className} {...props}><path {...common} d="M19 3A2.94 2.94 0 0 1 22 6v12a2.94 2.94 0 0 1-3 3H5a2.94 2.94 0 0 1-3-3V6a2.94 2.94 0 0 1 3-3h14ZM8.34 18.34V9.94H6V18.34h2.34Zm-1.18-9.46a1.36 1.36 0 1 0 0-2.72 1.36 1.36 0 0 0 0 2.72Zm12.5 9.46v-4.72c0-2.52-1.35-3.7-3.15-3.7a2.73 2.73 0 0 0-2.46 1.35h-.04v-1.16H11.7v8.23h2.31v-4.45c0-1.17.22-2.31 1.67-2.31 1.44 0 1.46 1.35 1.46 2.39v4.37h2.32Z"/></svg>
    );
  }
  if (name === "mail") {
    return (
      <svg viewBox="0 0 24 24" className={className} {...props}><path {...common} d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 4-8 5L4 8V6l8 5 8-5v2Z"/></svg>
    );
  }
  // default: X/Twitter
  return (
    <svg viewBox="0 0 24 24" className={className} {...props}>
      <path {...common} d="M18.9 2H22l-7.2 8.2L23.5 22H17l-5-6.6L6 22H2l7.6-8.7L.8 2h6.7l4.5 6 6.9-6Z"/>
    </svg>
  );
}

const defaultSections = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "Demo", href: "#demo" },
      { label: "Changelog", href: "#" },
    ],
  },
  {
    title: "Use cases",
    links: [
      { label: "Students", href: "#" },
      { label: "Researchers", href: "#" },
      { label: "Journalists", href: "#" },
      { label: "Field work", href: "#" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Docs", href: "#" },
      { label: "Guides", href: "#" },
      { label: "API", href: "#" },
      { label: "Status", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Contact", href: "#" },
      { label: "Press", href: "#" },
    ],
  },
];

const defaultSocial = [
  { name: "x", href: "https://twitter.com/" },
  { name: "github", href: "https://github.com/" },
  { name: "linkedin", href: "https://www.linkedin.com/" },
  { name: "mail", href: "mailto:hello@bulb.io" },
];

export default function Footer({
  brand = { name: "fixmynotes", href: "/" },
  tagline = "From noise → signal.",
  blurb = "Extract actions, build graphs, compile research, and cite sources—fast.",
  sections = defaultSections,
  social = defaultSocial,
  legal = [
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
    { label: "Security", href: "#" },
  ],
  className = "",
}) {
  const year = new Date().getFullYear();

  const LinkItem = ({ href = "#", children }) => (
    <motion.a
      href={href}
      className="block text-sm text-white/80 hover:text-white"
      whileHover={{ x: 2 }}
      transition={{ duration: 0.15 }}
    >
      {children}
    </motion.a>
  );

  return (
    <footer className={cx("relative mt-20", className)}>
      {/* gradient divider */}
      <div className="mx-auto max-w-6xl px-6">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* top brand + newsletter */}
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {/* Brand block */}
          <div className="lg:col-span-1">
            <div className="flex flex-col items-start text-left">
              <div className="flex items-center gap-4 flex-wrap">
                <a href={brand.href} className="inline-flex items-center gap-3">
                  <svg width="32" height="32" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 flex-shrink-0">
                    <defs>
                      <linearGradient id="rg-footer" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#4B68FF"/>
                        <stop offset="100%" stopColor="#4BE3FF"/>
                      </linearGradient>
                    </defs>
                    <circle cx="64" cy="64" r="50" stroke="url(#rg-footer)" strokeWidth="3" fill="none"/>
                    <g stroke="url(#rg-footer)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M30 78 C 50 70, 65 56, 82 50 S 106 54, 98 78" fill="none"/>
                      <circle cx="30" cy="78" r="5" fill="url(#rg-footer)"/>
                      <circle cx="82" cy="50" r="6" fill="url(#rg-footer)"/>
                      <circle cx="98" cy="78" r="5" fill="url(#rg-footer)"/>
                    </g>
                  </svg>
                  <span className="text-xl font-semibold tracking-wide text-white">{brand.name}</span>
                </a>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#4b68ff] flex-shrink-0 block" />
                  <span className="leading-none">{tagline}</span>
                </div>
              </div>
              <p className="mt-4 max-w-md text-sm text-white/70 leading-relaxed self-start">{blurb}</p>
            </div>

            {/* Social */}
            <div className="mt-5 flex items-center gap-3">
              {social.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  aria-label={s.name}
                  className="rounded-full border border-white/10 bg-white/5 p-2 text-white/70 hover:text-white hover:bg-white/10"
                >
                  <SocialIcon name={s.name} />
                </a>
              ))}
            </div>
          </div>

          {/* Link sections */}
          <div className="md:col-span-1 lg:col-span-2 grid grid-cols-2 gap-8 sm:grid-cols-3 text-left">
            {sections.map((sec) => (
              <div key={sec.title} className="min-w-[140px] text-left">
                <h4 className="text-sm font-semibold text-white text-left">{sec.title}</h4>
                <div className="mt-3 space-y-2 text-left">
                  {sec.links.map((l) => (
                    <LinkItem key={l.label} href={l.href}>
                      {l.label}
                    </LinkItem>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* bottom bar */}
        <div className="mt-10 flex flex-col-reverse items-start justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-white/60">© {year} {brand.name}. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4">
            {legal.map((l) => (
              <a key={l.label} href={l.href} className="text-xs text-white/70 hover:text-white">
                {l.label}
              </a>
            ))}
            <a
              href="#top"
              className="ml-2 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/80 hover:text-white"
              title="Back to top"
            >
              ↑ Back to top
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
