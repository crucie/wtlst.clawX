"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { CRAB_SHAPES, RENDER_ORDER } from "@/lib/crab-paths";

export default function CrabCursor() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Hide on touch/mobile devices
    if (window.matchMedia("(pointer: coarse)").matches) return;

    // Center the element on the cursor position (offset slightly)
    gsap.set(el, { xPercent: -50, yPercent: -50 });

    const xTo = gsap.quickTo(el, "x", { duration: 0.45, ease: "power3" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.45, ease: "power3" });

    // Subtle idle rotation oscillation
    gsap.to(el, {
      rotation: 6,
      duration: 3,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
    });

    const onMove = (e: MouseEvent) => {
      if (!visible) setVisible(true);
      // Offset slightly below-right of the actual cursor
      xTo(e.clientX + 14);
      yTo(e.clientY + 16);
    };

    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
    };
  }, [visible]);

  return (
    <div
      ref={ref}
      className="no-theme-transition"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: 34,
        height: 38,
        pointerEvents: "none",
        zIndex: 9997,
        opacity: visible ? 0.3 : 0,
        transition: "opacity 0.25s ease",
      }}
    >
      <svg
        viewBox="0 0 1402 1551"
        style={{ width: "100%", height: "100%", display: "block" }}
      >
        {RENDER_ORDER.map(i => (
          <path
            key={i}
            d={CRAB_SHAPES[i].d}
            fill={CRAB_SHAPES[i].fill}
            stroke="#1c0906"
            strokeWidth={CRAB_SHAPES[i].sw * 0.48}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ))}
      </svg>
    </div>
  );
}
