"use client";

import { useRef } from "react";
import { Sun, Moon } from "lucide-react";
import gsap from "gsap";
import { useTheme } from "@/components/ThemeProvider";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === "light";
  const btnRef = useRef<HTMLButtonElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);

  const handleClick = () => {
    // Animate the button: bounce + spin
    if (iconRef.current) {
      gsap.fromTo(iconRef.current,
        { rotation: -180, scale: 0.3 },
        { rotation: 0, scale: 1, duration: 0.5, ease: "back.out(2)" }
      );
    }
    if (btnRef.current) {
      gsap.fromTo(btnRef.current,
        { scale: 0.85 },
        { scale: 1, duration: 0.35, ease: "back.out(1.7)" }
      );
    }
    toggleTheme();
  };

  return (
    <button
      ref={btnRef}
      onClick={handleClick}
      aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
      className="relative flex items-center justify-center cursor-pointer"
      style={{
        width: 38,
        height: 38,
        border: "2px solid rgba(0,0,0,0.6)",
        background: isLight ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.85)",
        borderRadius: 0,
      }}
    >
      <div ref={iconRef} className="flex items-center justify-center">
        {isLight ? (
          <Moon size={17} strokeWidth={2.5} color="#1a1a1a" />
        ) : (
          <Sun size={17} strokeWidth={2.5} color="#E84142" />
        )}
      </div>
    </button>
  );
}
