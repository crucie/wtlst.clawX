"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import gsap from "gsap";

type Theme = "dark" | "light";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  toggleTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const scanRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  // Read persisted preference on mount
  useEffect(() => {
    const stored = localStorage.getItem("clawx-theme") as Theme | null;
    if (stored === "light" || stored === "dark") {
      setTheme(stored);
    }
    setMounted(true);
  }, []);

  // Sync to <html> attribute and localStorage
  useEffect(() => {
    if (!mounted) return;
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("clawx-theme", theme);
  }, [theme, mounted]);

  // GSAP transition on theme change (skip first render)
  useEffect(() => {
    if (!mounted) return;
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Flash overlay
    if (overlayRef.current) {
      gsap.fromTo(overlayRef.current,
        { opacity: 0.35 },
        { opacity: 0, duration: 0.55, ease: "power3.out" }
      );
    }

    // Red scanline sweep
    if (scanRef.current) {
      gsap.fromTo(scanRef.current,
        { top: "-4px", opacity: 1 },
        { top: "100vh", opacity: 0.6, duration: 0.6, ease: "power2.inOut" }
      );
    }
  }, [theme, mounted]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  // Prevent flash of wrong theme
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {/* Full-screen flash overlay */}
      <div
        ref={overlayRef}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 99998,
          pointerEvents: "none",
          opacity: 0,
          background: theme === "light" ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.85)",
          transition: "background 0s",
        }}
      />
      {/* Red scanline */}
      <div
        ref={scanRef}
        style={{
          position: "fixed",
          left: 0,
          top: "-4px",
          width: "100%",
          height: "3px",
          zIndex: 99999,
          pointerEvents: "none",
          opacity: 0,
          background: "#E84142",
          boxShadow: "0 0 24px 6px rgba(232,65,66,0.6), 0 0 80px 20px rgba(232,65,66,0.25)",
        }}
      />
      {children}
    </ThemeContext.Provider>
  );
}
