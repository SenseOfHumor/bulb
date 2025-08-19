import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";

gsap.registerPlugin(SplitText, ScrambleTextPlugin);

const ScrambledText = ({
  radius = 100,
  duration = 1.2,
  speed = 0.5,
  scrambleChars = ".:",
  className = "",
  style = {},
  children,
}) => {
  const rootRef = useRef(null);

  useEffect(() => {
    if (!rootRef.current) return;

    const split = SplitText.create(rootRef.current.querySelector("p"), {
      type: "words",
      wordsClass: "inline-block will-change-transform",
    });

    split.words.forEach((el) => {
      const c = el;
      gsap.set(c, { attr: { "data-content": c.innerHTML } });
    });

    const handleMove = (e) => {
      split.words.forEach((el) => {
        const c = el;
        const { left, top, width, height } = c.getBoundingClientRect();
        const dx = e.clientX - (left + width / 2);
        const dy = e.clientY - (top + height / 2);
        const dist = Math.hypot(dx, dy);

        if (dist < radius) {
          gsap.to(c, {
            overwrite: true,
            duration: duration * (1 - dist / radius),
            scrambleText: {
              text: c.dataset.content || "",
              chars: scrambleChars,
              speed,
            },
            ease: "none",
          });
        }
      });
    };

    const el = rootRef.current;
    el.addEventListener("pointermove", handleMove);

    return () => {
      el.removeEventListener("pointermove", handleMove);
      split.revert();
    };
  }, [radius, duration, speed, scrambleChars]);

  return (
    <div
      ref={rootRef}
      className={`w-full min-h-[20vh] font-mono text-[clamp(6px,2.5vw,18px)] text-white flex justify-center items-center ${className}`}
      style={style}
    >
  <p className="break-words text-left max-w-4xl mx-auto" style={{wordWrap: 'break-word', overflowWrap: 'break-word'}}>{children}</p>
    </div>
  );
};

export default ScrambledText;