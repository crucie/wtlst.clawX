"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { CRAB_SHAPES, RENDER_ORDER } from "@/lib/crab-paths";

export default function CrabCursor() {
  const avaxRef = useRef<HTMLDivElement>(null);
  const crabRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const avaxEl = avaxRef.current;
    const crabEl = crabRef.current;
    if (!avaxEl || !crabEl) return;

    // Hide on touch/mobile devices
    if (window.matchMedia("(pointer: coarse)").matches) return;

    // Hide default cursor globally
    document.documentElement.style.cursor = "none";
    document.body.style.cursor = "none";

    // Center elements on cursor coordinate
    gsap.set(avaxEl, { xPercent: -50, yPercent: -50 });
    gsap.set(crabEl, { xPercent: -50, yPercent: -50 });

    // Avalanche logo is the instant pointer
    const avaxXTo = gsap.quickTo(avaxEl, "x", { duration: 0.05, ease: "power3.out" });
    const avaxYTo = gsap.quickTo(avaxEl, "y", { duration: 0.05, ease: "power3.out" });

    // Crab logo is the trailing follow-up
    const crabXTo = gsap.quickTo(crabEl, "x", { duration: 0.45, ease: "power2.out" });
    const crabYTo = gsap.quickTo(crabEl, "y", { duration: 0.45, ease: "power2.out" });

    const onMove = (e: MouseEvent) => {
      if (!visible) setVisible(true);
      avaxXTo(e.clientX);
      avaxYTo(e.clientY);
      // Offset the trailing crab slightly so it never overlaps the Avax pointer
      crabXTo(e.clientX + 16);
      crabYTo(e.clientY + 18);
    };

    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);

    return () => {
      document.documentElement.style.cursor = "";
      document.body.style.cursor = "";
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
    };
  }, [visible]);

  return (
    <>
      {/* 1. Trailing Crab Follow-up */}
      <div
        ref={crabRef}
        className="no-theme-transition"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 44,
          height: 48,
          pointerEvents: "none",
          zIndex: 9998,
          opacity: visible ? 0.85 : 0,
          transition: "opacity 0.2s ease",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          viewBox="0 0 1402 1551"
          style={{ width: "100%", height: "100%", display: "block" }}
        >
          {RENDER_ORDER.map((i) => (
            <path
              key={i}
              d={CRAB_SHAPES[i].d}
              fill={CRAB_SHAPES[i].fill}
              stroke="var(--foreground)"
              strokeWidth={CRAB_SHAPES[i].sw * 0.48}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ))}
        </svg>
      </div>

      {/* 2. Avalanche Pointer (Moves instantly with mouse) */}
      <div
        ref={avaxRef}
        className="no-theme-transition"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 20,
          height: 21,
          pointerEvents: "none",
          zIndex: 9999,
          opacity: visible ? 1 : 0,
          transition: "opacity 0.2s ease",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          viewBox="0 0 127 133"
          style={{
            width: "100%",
            height: "100%",
            display: "block",
          }}
        >
          <path
            d="M75.3854 50.112L55.1804 85.1083L96.7803 85.7952L75.3854 50.112Z"
            stroke="var(--clx-red)"
            strokeWidth="12"
            fill="none"
          />
          <path
            d="M68.5907 39.1368L51.1091 5.21463L4.45433 86.0231L42.5721 84.2023L68.5907 39.1368Z"
            stroke="var(--clx-red)"
            strokeWidth="12"
            fill="none"
          />
        </svg>
      </div>
    </>
  );
}
