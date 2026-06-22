import { useEffect, useRef } from "react";
import {
  CRAB_SHAPES, CRAB_CX, CRAB_CY, CRAB_N, CRAB_RADII,
  RENDER_ORDER, MORPH_ORDER, MORPH_STEP, SPAWN_STEP,
  mkCircle, samplePath, interpPath,
  easeOutBack, easeOutCubic, easeOutQuint, easeInOutSine, easeOutExpo,
  clamp, norm,
  type Pt,
} from "@/lib/crab-paths";

// ─── Timing constants (seconds) ─────────────────────────────────────────────
const T_SPAWN_STAGGER = 0.03;
const T_SPAWN_DUR     = 0.6;
const T_SPAWN_TOTAL   = (CRAB_N - 1) * T_SPAWN_STAGGER + T_SPAWN_DUR;
const T_PAUSE         = 0.15;
const T_MORPH_OFFSET  = T_SPAWN_TOTAL + T_PAUSE;
const T_MORPH_STAGGER = 0.06;
const T_MORPH_DUR     = 0.7;
const ALL_MORPHED     = T_MORPH_OFFSET + (CRAB_N - 1) * T_MORPH_STAGGER + T_MORPH_DUR;
const T_SETTLE        = 0.3;
const T_HOLD          = 0.5;
const T_SCROLL        = 0.8;
const TOTAL           = ALL_MORPHED + T_SETTLE + T_HOLD + T_SCROLL;

// ─── Component ───────────────────────────────────────────────────────────────
export default function CrabLogoAnimation({ onComplete }: { onComplete?: () => void }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef  = useRef<SVGSVGElement>(null);
  const rafRef  = useRef<number>(0);
  const t0Ref   = useRef<number>(-1);
  const cPts    = useRef<Pt[][]>([]);
  const fPts    = useRef<Pt[][]>([]);
  const seeded  = useRef(false);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || seeded.current) return;
    seeded.current = true;

    // ── Sample both shapes (hidden off-screen) ─────────────────────────────
    const tmp = document.createElementNS("http://www.w3.org/2000/svg", "g");
    tmp.setAttribute("visibility", "hidden");
    svg.appendChild(tmp);
    CRAB_SHAPES.forEach((shape, i) => {
      const ce = document.createElementNS("http://www.w3.org/2000/svg", "path") as SVGPathElement;
      ce.setAttribute("d", mkCircle(CRAB_CX, CRAB_CY, CRAB_RADII[i]));
      tmp.appendChild(ce);
      cPts.current[i] = samplePath(ce, 200);

      const fe = document.createElementNS("http://www.w3.org/2000/svg", "path") as SVGPathElement;
      fe.setAttribute("d", shape.d);
      tmp.appendChild(fe);
      fPts.current[i] = samplePath(fe, 200);
    });
    svg.removeChild(tmp);

    const pathEls = CRAB_SHAPES.map((_, i) =>
      svg.querySelector<SVGPathElement>(`[data-idx="${i}"]`)
    );
    const groupEl = svg.querySelector<SVGGElement>(".sg");

    // ── RAF loop ──────────────────────────────────────────────────────────
    function tick(now: number): void {
      if (t0Ref.current < 0) t0Ref.current = now;
      const elapsed = (now - t0Ref.current) / 1000;
      if (onComplete && elapsed >= TOTAL) {
        onComplete();
        return;
      }
      const t = elapsed % TOTAL;

      // ── Group-level settle + breathe ─────────────────────────────────────
      if (groupEl) {
        let sc = 1;
        if (t > ALL_MORPHED && t < ALL_MORPHED + T_SETTLE) {
          const st = norm(t, ALL_MORPHED, ALL_MORPHED + T_SETTLE);
          sc = 1 + 0.016 * (1 - easeOutCubic(st)) * Math.sin(st * Math.PI);
        } else if (t >= ALL_MORPHED + T_SETTLE && t < ALL_MORPHED + T_SETTLE + T_HOLD) {
          const bt = norm(t, ALL_MORPHED + T_SETTLE, ALL_MORPHED + T_SETTLE + T_HOLD);
          sc = 1 + 0.004 * Math.sin(bt * Math.PI);
        }
        if (sc !== 1) {
          groupEl.setAttribute("transform",
            `translate(${CRAB_CX},${CRAB_CY}) scale(${sc}) translate(${-CRAB_CX},${-CRAB_CY})`);
        } else {
          groupEl.removeAttribute("transform");
        }
      }

      // ── Scroll up ──────────────────────────────────────────────────────────
      if (wrapRef.current) {
        const scrollStart = ALL_MORPHED + T_SETTLE + T_HOLD;
        const scrollRaw = norm(t, scrollStart, scrollStart + T_SCROLL);
        if (scrollRaw > 0) {
          wrapRef.current.style.transform = `translateY(${-easeInOutSine(scrollRaw) * 100}vh)`;
        }
      }

      pathEls.forEach((el, i) => {
        if (!el) return;
        const cp = cPts.current[i];
        const fp = fPts.current[i];
        if (!cp || !fp) return;

        const spawnStep = SPAWN_STEP[i];
        const morphStep = MORPH_STEP[i];

        // ── Spawn ───────────────────────────────────────────────────────────
        const sDel  = spawnStep * T_SPAWN_STAGGER;
        const sRaw  = norm(t, sDel, sDel + T_SPAWN_DUR);
        const sScale = easeOutBack(sRaw);
        const sDrift = 28 * (1 - easeOutCubic(sRaw));

        // ── Morph ───────────────────────────────────────────────────────────
        const mStart  = T_MORPH_OFFSET + morphStep * T_MORPH_STAGGER;
        const mRaw    = norm(t, mStart, mStart + T_MORPH_DUR);
        const mEase   = easeOutQuint(mRaw);

        // ── Opacity ─────────────────────────────────────────────────────────
        const spawnOp = easeOutExpo(clamp(sRaw * 1.5));
        el.style.opacity = clamp(spawnOp).toFixed(3);

        // ── Glimmer ─────────────────────────────────────────────────────────
        if (mRaw > 0.72 && mRaw < 1) {
          const gp = norm(mRaw, 0.72, 1);
          const brightness = 1 + 0.22 * Math.sin(gp * Math.PI);
          el.style.filter = `brightness(${brightness.toFixed(3)})`;
        } else {
          el.style.filter = "";
        }

        // ── Path ────────────────────────────────────────────────────────────
        let d: string;
        if (mRaw <= 0) {
          d = mkCircle(CRAB_CX, CRAB_CY + sDrift, CRAB_RADII[i] * Math.max(sScale, 0.001));
        } else if (mRaw >= 1) {
          d = CRAB_SHAPES[i].d;
          el.style.filter = "";
        } else {
          d = interpPath(cp, fp, mEase);
        }
        el.setAttribute("d", d);
      });

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafRef.current);
      seeded.current = false;
      t0Ref.current = -1;
    };
  }, [onComplete]);

  return (
    <div
      ref={wrapRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100vh",
        background: "var(--clx-bg, #0d0d0d)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        willChange: "transform",
      }}
    >
      <svg
        ref={svgRef}
        viewBox="0 0 1402 1551"
        aria-label="Animated crab logo"
        style={{
          width: "min(520px, 88vw)",
          display: "block",
        }}
      >
        <g className="sg">
          {RENDER_ORDER.map(i => (
            <path
              key={i}
              data-idx={i}
              d={mkCircle(CRAB_CX, CRAB_CY, CRAB_RADII[i])}
              fill={CRAB_SHAPES[i].fill}
              stroke="#1c0906"
              strokeWidth={CRAB_SHAPES[i].sw * 0.48}
              strokeLinejoin="round"
              strokeLinecap="round"
              style={{ opacity: 0, willChange: "opacity" }}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}