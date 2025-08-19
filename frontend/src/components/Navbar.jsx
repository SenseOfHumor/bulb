import { useEffect, useState } from "react";

export default function Navbar() {
  const [active, setActive] = useState("home");
  const [isScrolling, setIsScrolling] = useState(false);
  const [navW, setNavW] = useState("100%"); // used by w-[var(--nav-w)]

  const navItems = [
    { label: "Home", href: "#home", icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
        <path d="M21 20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V9.48907C3 9.18048 3.14247 8.88917 3.38606 8.69972L11.3861 2.47749C11.7472 2.19663 12.2528 2.19663 12.6139 2.47749L20.6139 8.69972C20.8575 8.88917 21 9.18048 21 9.48907V20ZM19 19V9.97815L12 4.53371L5 9.97815V19H19Z"/>
      </svg>
    )},
    { label: "About", href: "#about", icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
      </svg>
    )},
    { label: "Projects", href: "#projects", icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
        <path d="M4 5V19H20V7H11.5858L9.58579 5H4ZM12.4142 5H21C21.5523 5 22 5.44772 22 6V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3H10.4142L12.4142 5Z"/>
      </svg>
    )},
    { label: "Contact", href: "#contact", icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
        <path d="M21.7267 2.95694L16.2734 22.0432C16.1225 22.5716 15.7979 22.5956 15.5563 22.1126L11 13L1.9229 9.36919C1.41322 9.16532 1.41953 8.86022 1.95695 8.68108L21.0432 2.31901C21.5716 2.14285 21.8747 2.43866 21.7267 2.95694ZM19.0353 5.09647L6.81221 9.17085L12.4488 11.4255L15.4895 17.5068L19.0353 5.09647Z"/>
      </svg>
    )},
  ];

  useEffect(() => {
    const maxScroll = 1000;

    const update = () => {
      const y = window.scrollY || 0;
      const desktop = window.innerWidth >= 768;
      setIsScrolling(y > 0);

      if (desktop) {
        const progress = Math.min(y / maxScroll, 1);
        const ease = 1 - Math.pow(1 - progress, 4);
        // full width at top -> pill on scroll
        const maxPx = Math.min(window.innerWidth - 64, 1280);
        const minPx = 528;
        const current = Math.round(maxPx - (maxPx - minPx) * ease);
        setNavW(y === 0 ? "100%" : `${current}px`);
      } else {
        setNavW("100%");
      }
    };

    update();
    const onScroll = () => requestAnimationFrame(update);
    const onResize = () => requestAnimationFrame(update);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    // active section detection
    const sections = document.querySelectorAll("section[id]");
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { threshold: 0.6 }
    );
    sections.forEach((s) => io.observe(s));

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      io.disconnect();
    };
  }, []);

  const go = (e, href) => {
    e.preventDefault();
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      {/* spacer so the mobile bar doesn't cover content */}
      <div className="md:hidden h-16" />

      <nav
        style={{ ["--nav-w"]: navW }}
        className={[
          // layout / position
          "fixed z-50 inset-x-0",
          "bottom-0 md:bottom-auto md:top-6",
          "w-full md:w-[var(--nav-w)] md:max-w-[1280px] md:mx-auto",
          // transitions
          "transition-all duration-500",
          // Mobile only: always blurred
          "max-md:bg-white/10 max-md:border max-md:border-white/15 max-md:backdrop-blur-xl max-md:rounded-t-xl",
          // Desktop: original behavior
          !isScrolling
            ? "md:bg-transparent md:border md:border-transparent md:backdrop-blur-0 md:rounded-none"
            : "md:bg-white/10 md:border md:border-white/15 md:backdrop-blur-xl md:rounded-full"
        ].join(" ")}
      >
        <div className="px-3 py-3 md:px-6 md:py-3">
          <ul className="flex w-full items-center justify-between gap-6 md:justify-center md:gap-12">
            {navItems.map((item) => {
              const isActive = active === item.href.slice(1);
              return (
                <li key={item.label} className="flex-1 md:flex-none">
                  <a
                    href={item.href}
                    onClick={(e) => go(e, item.href)}
                    className={[
                      "group relative flex flex-col items-center gap-1 select-none",
                      "text-white/70 hover:text-white transition-colors",
                      "text-xs md:text-base",
                      isActive ? "text-white" : ""
                    ].join(" ")}
                  >
                    {/* active dot (desktop only) */}
                    <span
                      className={[
                        "hidden md:block absolute -left-6 top-1/2 -translate-y-1/2",
                        "h-2 w-2 rounded-full bg-sky-400",
                        "opacity-0 scale-0 transition-all duration-300",
                        isActive ? "opacity-100 scale-100" : ""
                      ].join(" ")}
                    />
                    {/* icon (mobile) */}
                    <span className="md:hidden flex items-center justify-center w-6 h-6">
                      {item.icon}
                    </span>
                    {/* labels */}
                    <span className="hidden md:inline-block">{item.label}</span>
                    <span className="md:hidden block">{item.label}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </>
  );
}
