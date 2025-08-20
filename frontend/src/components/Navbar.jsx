import { useEffect, useState } from "react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
  useAuth,
} from "@clerk/clerk-react";

export default function Navbar() {
  const [active, setActive] = useState("home");
  const [isScrolling, setIsScrolling] = useState(false);
  const [navW, setNavW] = useState("100%"); // used by w-[var(--nav-w)]
  const { isSignedIn } = useAuth();

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
    { label: "Pricing", href: "#pricing", icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
        <path d="M12 2C13.1 2 14 2.9 14 4V5H16C17.1 5 18 5.9 18 7V19C18 20.1 17.1 21 16 21H8C6.9 21 6 20.1 6 19V7C6 5.9 6.9 5 8 5H10V4C10 2.9 10.9 2 12 2ZM12 4V6H12V4ZM8 7V19H16V7H8ZM9 8H15V10H9V8ZM9 11H15V13H9V11ZM9 14H13V16H9V14Z"/>
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

    // active section detection - only for signed out users
    if (!isSignedIn) {
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
    } else {
      // For signed-in users, don't show active indicators
      setActive("");
      return () => {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onResize);
      };
    }
  }, [isSignedIn]);

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
          <ul className="flex w-full items-center justify-between gap-4 md:justify-center md:gap-8">
            {/* Main Navigation Items */}
            {navItems.map((item) => {
              const isActive = active === item.href.slice(1);
              return (
                <li key={item.label} className="flex-1 md:flex-none relative">
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
                        "hidden md:block absolute -left-4 top-1/2 -translate-y-1/2",
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
            
            {/* Authentication Items */}
            <SignedOut>
              {/* Desktop Auth Items */}
              <li className="hidden md:flex md:gap-4">
                <SignInButton mode="modal">
                  <button className="px-3 py-1 text-sm text-white/70 hover:text-white transition-colors whitespace-nowrap">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="px-3 py-1 text-sm bg-sky-500 hover:bg-sky-600 text-white rounded-full transition-colors whitespace-nowrap">
                    Sign Up
                  </button>
                </SignUpButton>
              </li>
              
              {/* Mobile Auth Item */}
              <li className="flex-1 md:hidden">
                <SignInButton mode="modal">
                  <button className="flex flex-col items-center gap-1 text-white/70 hover:text-white transition-colors">
                    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
                      <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 6.5V8.5L21 9ZM15 10.5V12.5L21 13V11L15 10.5ZM21 15V17L15 16.5V14.5L21 15ZM15 18.5V20.5L21 21V19L15 18.5ZM12 7C8.13 7 5 10.13 5 14S8.13 21 12 21S19 17.87 19 14S15.87 7 12 7ZM12 19C9.24 19 7 16.76 7 14S9.24 9 12 9S17 11.24 17 14S14.76 19 12 19Z"/>
                    </svg>
                    <span className="text-xs">Sign In</span>
                  </button>
                </SignInButton>
              </li>
            </SignedOut>
            
            <SignedIn>
              {/* Desktop User Button */}
              <li className="hidden md:block">
                <UserButton 
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8"
                    }
                  }}
                />
              </li>
              
              {/* Mobile User Item */}
              <li className="flex-1 md:hidden">
                <div className="flex flex-col items-center gap-1 text-white/70 hover:text-white transition-colors">
                  <UserButton 
                    appearance={{
                      elements: {
                        avatarBox: "w-6 h-6"
                      }
                    }}
                  />
                  <span className="text-xs">Profile</span>
                </div>
              </li>
            </SignedIn>
          </ul>
        </div>
      </nav>
    </>
  );
}
