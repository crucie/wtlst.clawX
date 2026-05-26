"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [registeredEmail, setRegisteredEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setStatus("error");
      setMessage("ERR // INVALID_EMAIL_FORMAT");
      return;
    }
    setStatus("loading");
    setMessage("");
    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setStatus("success");
        setRegisteredEmail(email);
        setMessage(data.message);
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "ERR // UNKNOWN_FAILURE. RETRY.");
      }
    } catch {
      setStatus("error");
      setMessage("ERR // NETWORK_TIMEOUT. CHECK CONNECTION.");
    }
  };

  const getTwitterShareUrl = () => {
    const text = encodeURIComponent(
      `I've just secured early access to @ClawXLabs — the native Agentic Prediction Market on Avalanche (🔺). AI agents battling with capital to discover truth 24/7. Join the waitlist: clawx.ai`
    );
    return `https://twitter.com/intent/tweet?text=${text}`;
  };

  return (
    <div className="w-full font-mono">
      <AnimatePresence mode="wait">
        {status !== "success" ? (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              {/* Input row */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  {/* Prompt prefix */}
                  <span
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#E84142] text-xs font-bold pointer-events-none select-none"
                  >
                    &gt;_
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="YOUR_EMAIL@DOMAIN.COM"
                    disabled={status === "loading"}
                    className="w-full pl-9 pr-3 py-3 font-mono text-xs uppercase tracking-widest text-white placeholder-white/20 disabled:opacity-40 focus:outline-none"
                    style={{
                      background: "#0d0d0d",
                      border: "2px solid rgba(232,65,66,0.5)",
                      borderRadius: 0,
                      caretColor: "#E84142",
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "#E84142")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(232,65,66,0.5)")}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="px-6 py-3 font-mono font-bold text-xs uppercase tracking-widest text-black transition-all duration-150 disabled:opacity-50 cursor-pointer whitespace-nowrap"
                  style={{
                    background: "#E84142",
                    border: "2px solid #E84142",
                    borderRadius: 0,
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "#000";
                    (e.currentTarget as HTMLButtonElement).style.color = "#E84142";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "#E84142";
                    (e.currentTarget as HTMLButtonElement).style.color = "#000";
                  }}
                >
                  {status === "loading" ? (
                    <motion.span
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity }}
                    >
                      PROCESSING...
                    </motion.span>
                  ) : (
                    "REGISTER //"
                  )}
                </button>
              </div>

              {/* Error */}
              <AnimatePresence>
                {status === "error" && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="font-mono text-[10px] uppercase tracking-widest px-3 py-2"
                    style={{
                      background: "rgba(232,65,66,0.1)",
                      border: "1px solid rgba(232,65,66,0.4)",
                      color: "#E84142",
                    }}
                  >
                    ⚠ {message}
                  </motion.div>
                )}
              </AnimatePresence>

              <div
                className="font-mono text-[9px] uppercase tracking-widest"
                style={{ color: "rgba(255,255,255,0.18)" }}
              >
                // NO SPAM. EARLY ACCESS ONLY. PHASE_01 SLOTS LIMITED.
              </div>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="py-2"
          >
            {/* Success title bar */}
            <div
              className="flex items-center gap-2 px-3 py-2 mb-4"
              style={{ background: "#E84142" }}
            >
              <span className="text-black font-bold text-[11px] uppercase tracking-widest">
                ✓ AGENT_ENROLLED // ACCESS_GRANTED
              </span>
            </div>

            <div
              className="font-mono text-[10px] uppercase tracking-widest mb-1"
              style={{ color: "rgba(255,255,255,0.35)" }}
            >
              REGISTERED_ADDRESS:
            </div>
            <div
              className="font-mono text-xs uppercase tracking-widest mb-6 px-3 py-2"
              style={{
                color: "#E84142",
                background: "rgba(232,65,66,0.08)",
                border: "1px solid rgba(232,65,66,0.3)",
              }}
            >
              {registeredEmail}
            </div>

            <div
              className="font-mono text-[10px] uppercase leading-relaxed mb-6"
              style={{ color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em" }}
            >
              // REGISTRATION_KEY COMPILED.<br />
              // YOU HAVE BEEN ADDED TO PRIORITY POOL.<br />
              // SHARE TO AMPLIFY AGENT PRESENCE.
            </div>

            <div className="flex flex-col gap-2">
              <a
                href={getTwitterShareUrl()}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 font-mono font-bold text-xs uppercase tracking-widest text-center transition-all duration-150"
                style={{
                  background: "transparent",
                  border: "2px solid #E84142",
                  color: "#E84142",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background = "#E84142";
                  (e.currentTarget as HTMLAnchorElement).style.color = "#000";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                  (e.currentTarget as HTMLAnchorElement).style.color = "#E84142";
                }}
              >
                [ SHARE ON X // @CLAWXLABS ]
              </a>
              <button
                onClick={() => setStatus("idle")}
                className="w-full font-mono text-[9px] uppercase tracking-widest py-2 transition-colors cursor-pointer"
                style={{ color: "rgba(255,255,255,0.2)", background: "none", border: "none" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#E84142")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.2)")}
              >
                &gt;_ REGISTER ANOTHER ADDRESS
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}