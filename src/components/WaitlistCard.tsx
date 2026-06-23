"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { joinWaitlist } from "@/app/actions";
import templates from "@/tweet-templates.json";

interface WaitlistCardProps {
  initialCount: number;
}

export default function WaitlistCard({ initialCount }: WaitlistCardProps) {
  const [liveCount, setLiveCount] = useState(initialCount);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "error" | "success">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [userPosition, setUserPosition] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await joinWaitlist(fd);
      if (res.success) {
        const pos = (res as { success: true; position: number }).position;
        setUserPosition(pos);
        setLiveCount(pos);
        setStatus("success");
        setEmail("");
      } else {
        setErrorMsg((res as { success: false; error: string }).error);
        setStatus("error");
      }
    });
  };

  const twitterUrl = () => {
    const suffix = "\n\n@ClawXLabs | waitlist.clawxlab.xyz \n@avax @AvaLabs @AvaxTeam1 @Team1IND @AvalancheFDN";
    
    let template = "Securing my slot as Agent #{{num}} out of {{total}} in ClawX early access. On-chain prediction markets are evolving on Avalanche. 🔺";
    if (templates && templates.length > 0) {
      const randomIndex = Math.floor(Math.random() * templates.length);
      template = templates[randomIndex];
    }

    const displayNum = userPosition ? userPosition.toLocaleString() : "X";
    const displayTotal = liveCount ? liveCount.toLocaleString() : "X";

    let dynamicText = template
      .replaceAll("{{num}}", displayNum)
      .replaceAll("{{total}}", displayTotal);

    const maxDynamicLength = 280 - suffix.length;
    if (dynamicText.length > maxDynamicLength) {
      dynamicText = dynamicText.substring(0, maxDynamicLength - 3) + "...";
    }

    const fullTweet = `${dynamicText}${suffix}`;
    return `https://twitter.com/intent/tweet?text=${encodeURIComponent(fullTweet)}`;
  };

  return (
    <section
      id="waitlist"
      className="relative py-24 md:py-32 px-6 flex items-center justify-center min-h-[75vh] bg-red-deep"
    >
      {/* Extruded concave curve spacer on top */}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-none transform -translate-y-[99%] pointer-events-none">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-12 md:h-20 text-red-deep fill-current">
          <path d="M0,120 L0,0 C300,100 900,100 1200,0 L1200,120 Z"></path>
        </svg>
      </div>
      {/* Newspaper ink grain texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `radial-gradient(circle, #E8E0D4 1.5px, transparent 1.5px)`,
          backgroundSize: "16px 16px",
        }}
      />

      {/* ══ The card — retro 2D flat ══ */}
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-[42rem] border-2 border-ink shadow-[8px_8px_0px_#E84142] bg-surface overflow-hidden"
      >
        {/* Card title bar — differentiated bg to avoid fusion */}
        <div className="bg-surface-raised border-b-2 border-ink px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/icon.svg" alt="ClawX" width={16} height={13} className="w-4 h-auto brightness-200" />
            <span className="text-ink font-mono font-bold text-[0.6rem] tracking-[0.22em] uppercase">
              ClawX — Early Access
            </span>
          </div>
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-deep border border-ink/20" />
            <span className="w-2.5 h-2.5 rounded-full bg-red border border-ink/20" />
            <span className="w-2.5 h-2.5 rounded-full bg-red-bright border border-ink/20" />
          </div>
        </div>

        {/* Card body — 2 column */}
        <div className="grid md:grid-cols-[5fr_7fr]">

          {/* LEFT — red accent panel */}
          <div className="bg-red border-r-2 border-ink p-6 flex flex-col justify-between relative">
            {/* Ink drop watermark overlay on left panel */}
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none opacity-[0.08]"
              style={{
                backgroundImage: `radial-gradient(circle, #000 1px, transparent 1px)`,
                backgroundSize: "14px 14px",
              }}
            />
            <div className="relative z-10">
              <p className="text-[0.55rem] font-mono font-bold tracking-[0.28em] uppercase text-bg/60 mb-2">
                STATUS // ACTIVE
              </p>
              <p className="text-2xl font-headline font-black text-bg mb-2 leading-snug">
                Put capital where your <span className="underline decoration-dotted">AI convictions</span> lie.
              </p>
              <p className="text-xs text-bg/60 font-semibold leading-relaxed font-body">
                Early access registration for the agentic predictions swarm on Avalanche.
              </p>
            </div>

            {/* Retro counter */}
            <div className="relative z-10 mt-6 pt-5 border-t-2 border-bg/20">
              <p className="text-[0.55rem] font-mono font-bold tracking-[0.28em] uppercase text-bg/60 mb-1">
                AGENTS RECORDED
              </p>
              <p className="font-mono font-bold text-bg text-3xl leading-none">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={liveCount}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="inline-block"
                  >
                    {String(liveCount).padStart(4, "0")}
                  </motion.span>
                </AnimatePresence>
              </p>
              {/* Progress track */}
              <div className="mt-3 h-[3px] w-full bg-bg/15 overflow-hidden">
                <motion.div
                  className="h-full bg-bg"
                  initial={{ width: "0%" }}
                  animate={{ width: `${Math.min((liveCount / 1000) * 100, 100)}%` }}
                  transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                />
              </div>
              <p className="mt-1 text-[0.55rem] font-mono font-bold tracking-widest uppercase text-bg/50">
                {Math.round(Math.min((liveCount / 1000) * 100, 100))}% / Goal 1000
              </p>
            </div>
          </div>

          {/* RIGHT — form / success */}
          <div className="p-6 flex items-center bg-surface">
            <div className="w-full">
              <AnimatePresence mode="wait">
                {status !== "success" ? (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <h3 className="text-sm font-headline font-bold text-ink tracking-tight mb-0.5 uppercase">
                      Allocate Spot
                    </h3>
                    <p className="text-xs text-ink-muted font-mono font-bold mb-5">
                      Next Agent ID: <span className="text-red">#{(liveCount + 1).toLocaleString()}</span>
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-3">
                      <div>
                        <label className="block text-[0.55rem] font-mono font-bold tracking-[0.2em] uppercase text-ink-muted mb-1.5">
                          AGENT_EMAIL
                        </label>
                        <input
                          type="email"
                          name="email"
                          required
                          placeholder="agent@domain.com"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (status === "error") setStatus("idle");
                          }}
                          className="w-full px-4 py-3 bg-bg border-2 border-ink/20 text-[0.8rem] font-mono font-bold text-ink placeholder:text-ink-faint placeholder:font-normal outline-none transition-all duration-150 focus:border-red focus:shadow-[3px_3px_0px_#E84142]"
                        />
                      </div>

                      <motion.button
                        type="submit"
                        disabled={isPending}
                        className="w-full py-3.5 bg-ink border-2 border-ink text-bg font-mono font-bold text-[0.75rem] tracking-[0.16em] uppercase disabled:opacity-50 disabled:cursor-not-allowed shadow-[4px_4px_0px_#E84142] transition-all duration-150 cursor-pointer"
                        whileHover={!isPending ? { x: 3, y: 3, boxShadow: "1px 1px 0px #E84142" } : {}}
                        whileTap={!isPending ? { x: 4, y: 4, boxShadow: "0px 0px 0px #E84142" } : {}}
                      >
                        {isPending ? "Connecting…" : "Join Waitlist →"}
                      </motion.button>
                    </form>

                    <AnimatePresence>
                      {status === "error" && (
                        <motion.div
                          key="err"
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mt-3 px-3 py-2 border-2 border-red bg-red-dark text-red text-xs font-bold font-mono"
                        >
                          ⚠ {errorMsg}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ) : (
                  /* ── SUCCESS STATE ── */
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    className="text-center py-2"
                  >
                    {/* Confirmation stamp */}
                    <motion.div
                      initial={{ rotate: -12, scale: 0.5 }}
                      animate={{ rotate: -6, scale: 1 }}
                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                      className="inline-block mb-6"
                    >
                      <div className="border-[3px] border-red px-5 py-3 rotate-[-6deg] shadow-[3px_3px_0px_#E84142] bg-surface">
                        <p className="text-[0.55rem] font-mono font-bold tracking-[0.25em] uppercase text-red">
                          CONFIRMED
                        </p>
                        <p className="text-2xl font-mono font-bold text-ink leading-none">
                          #{userPosition?.toLocaleString()}
                        </p>
                        <p className="text-[0.5rem] font-mono font-bold tracking-widest uppercase text-ink-muted">
                          CLAWX WAITLIST
                        </p>
                      </div>
                    </motion.div>

                    <motion.h3
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.4 }}
                      className="text-sm font-headline font-bold text-ink uppercase tracking-tight mb-1"
                    >
                      Welcome to the swarm.
                    </motion.h3>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3, duration: 0.4 }}
                      className="text-xs text-ink-muted font-medium mb-5"
                    >
                      Share your position — priority allocation for active agents.
                    </motion.p>

                    <motion.a
                      href={twitterUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35, duration: 0.4 }}
                      className="inline-flex items-center justify-center gap-2.5 px-6 py-3 bg-ink border-2 border-ink text-bg font-mono font-bold text-xs tracking-[0.12em] uppercase shadow-[4px_4px_0px_#E84142] transition-all duration-150 hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[1px_1px_0px_#E84142] w-full"
                    >
                      <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.26 5.631L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
                      </svg>
                      Share Agent Status
                    </motion.a>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Card footer strip */}
        <div className="bg-bg/40 border-t-2 border-ink/10 px-5 py-2.5 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red animate-pulse" />
            <span className="text-[0.55rem] font-mono font-bold tracking-[0.18em] uppercase text-ink-muted">SYS_LIVE</span>
          </span>
        </div>
      </motion.div>
    </section>
  );
}
