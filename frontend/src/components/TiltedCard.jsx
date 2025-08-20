import { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import image from "/fixmynotes-ring.svg";

const fixmynotes = <img src={image} alt="Fix My Notes" />;

const springValues = {
  damping: 30,
  stiffness: 100,
  mass: 2,
};

export default function TiltedCard({
  imageSrc,
  altText = "Tilted card image",
  captionText = "",
  containerHeight = "300px",
  containerWidth = "100%",
  imageHeight = "300px",
  imageWidth = "300px",
  scaleOnHover = 1.1,
  rotateAmplitude = 14,
  showMobileWarning = true,
  showTooltip = true,
  overlayContent = null,
  displayOverlayContent = false,
}) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  // Default tilted state: slightly backwards (-8) and right (12)
  const rotateX = useSpring(useMotionValue(18), springValues);
  const rotateY = useSpring(useMotionValue(12), springValues);
  const scale = useSpring(scaleOnHover, springValues); // Start with hover scale
  const opacity = useSpring(1); // Start with overlay visible
  const rotateFigcaption = useSpring(0, {
    stiffness: 350,
    damping: 30,
    mass: 1,
  });

  const [lastY, setLastY] = useState(0);

  // Initialize proper values for mobile on mount
  useEffect(() => {
    scale.set(scaleOnHover);
    opacity.set(1);
    rotateX.set(-8);
    rotateY.set(12);
  }, [scale, opacity, rotateX, rotateY, scaleOnHover]);

  function handleMouse(e) {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - rect.width / 2;
    const offsetY = e.clientY - rect.top - rect.height / 2;

    const rotationX = (offsetY / (rect.height / 2)) * -rotateAmplitude;
    const rotationY = (offsetX / (rect.width / 2)) * rotateAmplitude;

    rotateX.set(rotationX);
    rotateY.set(rotationY);

    x.set(e.clientX - rect.left);
    y.set(e.clientY - rect.top);

    const velocityY = offsetY - lastY;
    rotateFigcaption.set(-velocityY * 0.6);
    setLastY(offsetY);
  }

  function handleMouseEnter() {
    scale.set(scaleOnHover * 1.05); // Slightly more scale on hover
    opacity.set(1);
  }

  function handleMouseLeave() {
    opacity.set(1); // Keep overlay visible
    scale.set(scaleOnHover); // Return to default hover scale
    rotateX.set(-8); // Return to default backwards tilt
    rotateY.set(12); // Return to default right tilt
    rotateFigcaption.set(0);
  }

  // Set initial values for mobile (no mouse interactions)
  function handleTouchStart() {
    scale.set(scaleOnHover);
    opacity.set(1);
    rotateX.set(-8);
    rotateY.set(12);
  }

  return (
    <figure
      ref={ref}
      className="relative w-full h-full [perspective:800px] flex flex-col items-center justify-center"
      style={{
        height: containerHeight,
        width: containerWidth,
        minHeight: containerHeight, // Ensure minimum height on mobile
        minWidth: containerWidth,   // Ensure minimum width on mobile
      }}
      onMouseMove={handleMouse}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
    >
      {showMobileWarning && (
        <div className="absolute top-4 text-center text-sm block sm:hidden">
          This effect is not optimized for mobile. Check on desktop.
        </div>
      )}

      <motion.div
        className="relative [transform-style:preserve-3d]"
        style={{
          width: imageWidth,
          height: imageHeight,
          rotateX,
          rotateY,
          scale,
        }}
      >
        <motion.img
          src={imageSrc}
          alt={altText}
          className="absolute top-0 left-0 object-cover rounded-[15px] will-change-transform [transform:translateZ(0)] max-w-full max-h-full"
          style={{
            width: imageWidth,
            height: imageHeight,
          }}
        />

        {displayOverlayContent && overlayContent && (
          <motion.div
            className="absolute top-0 left-0 z-[2] will-change-transform [transform:translateZ(30px)]"
          >
            <span className="inline-block rounded-full bg-white/80 text-black px-4 py-2 text-sm font-semibold shadow">
              {overlayContent}
            </span>
          </motion.div>
        )}
      </motion.div>

      {showTooltip && (
        <motion.figcaption
          className="pointer-events-none absolute left-0 top-0 rounded-[4px] bg-white px-[10px] py-[4px] text-[10px] text-[#2d2d2d] opacity-0 z-[3] hidden sm:block"
          style={{
            x,
            y,
            opacity,
            rotate: rotateFigcaption,
          }}
        >
          {captionText}
        </motion.figcaption>
      )}
    </figure>
  );
}
