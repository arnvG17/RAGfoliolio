/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useRef, useState } from "react";

// =================== BlobCursor ===================
const BlobCursor = ({
  trailLength = 10,
  size = 120,
  color = "rgba(82, 39, 255, 0.4)",
  shadowColor = "rgba(82, 39, 255, 0.2)",
  blobType = "circle",
  zIndex = 1,
  useFilter = true,
}) => {
  const [positions, setPositions] = useState(
    Array(trailLength).fill({ x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0, y: typeof window !== 'undefined' ? window.innerHeight / 2 : 0 })
  );
  const requestRef = useRef(null);
  const mousePos = useRef({ x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0, y: typeof window !== 'undefined' ? window.innerHeight / 2 : 0 });

  // Track mouse only within About section
  useEffect(() => {
    const handleMouseMove = (e) => {
      const aboutSection = document.getElementById("about");
      if (aboutSection) {
        const rect = aboutSection.getBoundingClientRect();
        
        // Only track mouse if it's within the About section
        if (
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom
        ) {
          mousePos.current = { x: e.clientX, y: e.clientY };
        }
      }
    };
    window.addEventListener("mousemove", handleMouseMove);

    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Animate trail
  useEffect(() => {
    const animate = () => {
      setPositions((prev) => {
        const newPos = [...prev];
        newPos[0] = mousePos.current; // first = cursor
        for (let i = 1; i < trailLength; i++) {
          const prevPos = newPos[i - 1];
          const currentPos = newPos[i];
          newPos[i] = {
            x: currentPos.x + (prevPos.x - currentPos.x) * 0.3,
            y: currentPos.y + (prevPos.y - currentPos.y) * 0.3,
          };
        }
        return newPos;
      });
      requestRef.current = requestAnimationFrame(animate);
    };
    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [trailLength]);

  return (
    <>
      <svg width="0" height="0">
        <defs>
          <filter id="enhanced-blob-filter" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blurred" />
            <feColorMatrix
              in="blurred"
              type="matrix"
              values="
                1.2 0   0   0   0
                0   1.2 0   0   0
                0   0   1.2 0   0
                0   0   0   18  -8"
            />
            <feBlend in="SourceGraphic" in2="blurred" mode="normal" />
          </filter>
        </defs>
      </svg>

      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        {positions.map((pos, i) => {
          const opacity = 1 - i / trailLength;
          const scale = 1 - i / (trailLength * 1.5);
          const blur = i === 0 ? 20 : 40;

          return (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                transform: `translate3d(${pos.x - size / 2}px, ${pos.y - size / 2}px, 0) scale(${scale})`,
                width: size,
                height: size,
                backgroundColor: color,
                opacity,
                borderRadius: blobType === "circle" ? "50%" : "20%",
                boxShadow: `0 0 ${blur}px ${shadowColor}`,
                filter: useFilter ? "url(#enhanced-blob-filter)" : "none",
                zIndex: zIndex - i,
                transition: "transform 0.15s ease-out, opacity 0.15s ease-out",
              }}
            />
          );
        })}
      </div>
    </>
  );
};

// =================== AboutSection ===================
const AboutSection = () => {
  return (
    <section
      id="about"
      className="relative flex items-center justify-center min-h-screen px-6 py-20 overflow-hidden bg-black"
    >
      {/* Blob cursor */}
      <BlobCursor />

      {/* Content */}
      <div className="relative z-10 max-w-4xl text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-accent">✦</span>
          <span className="text-accent font-medium text-sm tracking-wider uppercase">
            About Me
          </span>
        </div>
        <p className="text-2xl md:text-3xl lg:text-4xl font-light leading-relaxed text-muted-foreground">
          I'm{" "}
          <span className="text-foreground font-medium">Arnav Gawandi</span>, a{" "}
          <span className="text-accent font-medium">web designer</span> who approaches
          every project as if crafting a{" "}
          <span className="text-foreground font-medium">bespoke home</span>. I immerse
          myself in your vision, shaping every{" "}
          <span className="text-accent font-medium">layout, interaction, and detail</span>{" "}
          with care and intention. My goal is to create digital spaces that are{" "}
          <span className="text-foreground font-medium">visually striking</span> yet{" "}
          <span className="text-accent font-medium">personal, functional, and welcoming</span>,
          a place where your <span className="text-foreground font-medium">brand truly lives </span>
          and connects with its audience.
        </p>
      </div>
    </section>
  );
};

export default AboutSection;