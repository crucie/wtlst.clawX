"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/components/ThemeProvider";

function Blink({ char = "█" }: { char?: string }) {
  return (
    <motion.span
      animate={{ opacity: [1, 0, 1] }}
      transition={{ duration: 0.9, repeat: Infinity }}
      className="inline-block"
    >
      {char}
    </motion.span>
  );
}

export default function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [tweetText, setTweetText] = useState("");
  const [isCompiling, setIsCompiling] = useState(false);
  const [waitlistCount, setWaitlistCount] = useState<number | null>(null);
  const { theme } = useTheme();
  const isLight = theme === "light";

  // Fetch initial waitlist count on mount and poll for real-time updates
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchCount = async () => {
      try {
        const res = await fetch("/api/waitlist", { signal: controller.signal });
        const data = await res.json();
        if (isMounted && data.success) {
          setWaitlistCount(data.count);
        }
      } catch {
        // Silently ignore — the polling interval will retry automatically
      }
    };

    // Small delay before the initial fetch to let hydration complete
    const initialTimer = setTimeout(fetchCount, 100);
    const interval = setInterval(fetchCount, 5000);

    return () => {
      isMounted = false;
      controller.abort();
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, []);

  const generateTweet = async (agentNumber?: number, totalCount?: number) => {
    setIsCompiling(true);
    try {
      const res = await fetch("/api/generate-tweet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentNumber, totalCount }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setShareUrl(data.shareUrl);
        setTweetText(data.tweetText);
      } else {
        console.warn("Failed to generate custom tweet:", data.error);
        const displayNum = agentNumber ? `#${agentNumber.toLocaleString()}` : "";
        const fallbackText = `I've just secured early access ${displayNum ? `as Agent ${displayNum} ` : ""}to @ClawXLabs — the native Agentic Prediction Market on Avalanche (🔺). Join here: https://waitlist.clawxlab.xyz?v=2 \n@ClawXLabs \n@AvalancheFDN`;
        setTweetText(fallbackText);
        setShareUrl(`https://twitter.com/intent/tweet?text=${encodeURIComponent(fallbackText)}`);
      }
    } catch (err) {
      console.error("Error connecting to generate-tweet API:", err);
    } finally {
      setIsCompiling(false);
    }
  };

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
        // Dynamically update count with the allocated position
        if (data.count) {
          setWaitlistCount(data.count);
        }
        // Pre-generate the initial dynamic tweet URL (non-blocking)
        generateTweet(data.count, data.count);
      } else {
        setStatus("error");
        setMessage(data.error || "ERR // UNKNOWN_FAILURE. RETRY.");
      }
    } catch {
      setStatus("error");
      setMessage("ERR // NETWORK_TIMEOUT. CHECK CONNECTION.");
    }
  };

  // Determine Title Bar text dynamically based on state
  const getCardTitle = () => {
    if (status === "success" && waitlistCount !== null) {
      return `◆ AGENT #${waitlistCount.toLocaleString()} ◆ AGENT_ALLOCATED // ACCESS_GRANTED ◆ AGENT #${waitlistCount.toLocaleString()} ◆`;
    }
    return "◆ WAITLIST_REGISTRATION.EXE ◆";
  };

  return (
    <div className="relative w-full">
      {/* Card outer border */}
      <div
        style={{
          border: "3px solid var(--clx-card-outer-border)",
          padding: "3px",
          background: "var(--clx-bg)",
        }}
      >
        <div
          style={{
            border: "1px solid var(--clx-card-border)",
            background: "var(--clx-card-bg)",
          }}
        >
          {/* Card title bar */}
          <div
            className="flex items-center justify-between px-4 py-2"
            style={{
              background: "var(--clx-red)",
              borderBottom: "1px solid var(--clx-red)",
            }}
          >
            <span
              className="font-mono font-bold text-[10px] uppercase tracking-widest truncate max-w-[85%]"
              style={{ color: isLight ? "#fff" : "#000" }}
            >
              {getCardTitle()}
            </span>
            <div className="flex gap-1 shrink-0">
              {["▪", "▪", "▪"].map((s, i) => (
                <div
                  key={i}
                  className="w-4 h-4 flex items-center justify-center"
                  style={{ background: isLight ? "#fff" : "#000" }}
                >
                  <span className="text-[8px]" style={{ color: "var(--clx-red)" }}>
                    {s}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Card body */}
          <div className="p-8">
            {/* Prominent Counter */}
            {waitlistCount !== null && (
              <div className="mb-8 text-center" style={{ borderBottom: "1px dashed var(--clx-card-border)", paddingBottom: "20px" }}>
                <h2
                  className="font-mono font-bold uppercase"
                  style={{
                    fontSize: "clamp(24px, 4vw, 36px)",
                    color: "var(--clx-red)",
                    letterSpacing: "0.05em",
                    lineHeight: 1.1,
                  }}
                >
                  {waitlistCount.toLocaleString()} Agents
                </h2>
                <div className="font-mono text-[10px] uppercase tracking-widest mt-2" style={{ color: "var(--clx-text-muted)" }}>
                  Have joined the prediction arena
                </div>
              </div>
            )}

            <AnimatePresence mode="wait">
              {status !== "success" ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="mb-6">
                    <div
                      className="font-mono font-bold uppercase mb-1"
                      style={{
                        fontSize: "clamp(18px, 3vw, 26px)",
                        color: "var(--clx-text)",
                        letterSpacing: "0.02em",
                      }}
                    >
                      Secure Your Slot
                    </div>
                    <div
                      className="font-mono font-bold uppercase flex flex-wrap items-center gap-2"
                      style={{
                        fontSize: "clamp(18px, 3vw, 26px)",
                        color: "var(--clx-red)",
                        letterSpacing: "0.02em",
                      }}
                    >
                      <span>Join the Waitlist</span>
                      {waitlistCount !== null && (
                        <span
                          className="font-mono text-xs font-bold px-2 py-0.5 border"
                          style={{
                            borderColor: "var(--clx-red)",
                            color: "var(--clx-red)",
                            fontSize: "clamp(10px, 1.5vw, 13px)",
                            borderRadius: "2px",
                            background: "rgba(232, 65, 66, 0.05)"
                          }}
                        >
                          {waitlistCount.toLocaleString()} ALLOCATED
                        </span>
                      )}
                      <Blink />
                    </div>

                    <p
                      className="font-mono text-[11px] uppercase mt-4 leading-relaxed"
                      style={{ color: "var(--clx-text-muted)", letterSpacing: "0.08em" }}
                    >
                      Autonomous agents are currently validating predictive protocols on-chain.
                      Provide your email address below to secure priority access and allocate an agent slot.
                    </p>
                  </div>

                  <div className="mb-6" style={{ borderTop: "1px dashed var(--clx-red-muted)" }} />

                  <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    {/* Input row */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="relative flex-1">
                        {/* Prompt prefix */}
                        <span
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold pointer-events-none select-none"
                          style={{ color: "var(--clx-red)" }}
                        >
                          &gt;_
                        </span>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your_email@domain.com"
                          disabled={status === "loading"}
                          className="w-full pl-9 pr-3 py-3 font-mono text-xs tracking-widest disabled:opacity-40 focus:outline-none"
                          style={{
                            background: "var(--clx-input-bg)",
                            border: "2px solid var(--clx-input-border)",
                            borderRadius: 0,
                            caretColor: "var(--clx-red)",
                            color: "var(--clx-input-text)",
                          }}
                          onFocus={(e) => (e.currentTarget.style.borderColor = "var(--clx-red)")}
                          onBlur={(e) => (e.currentTarget.style.borderColor = "var(--clx-input-border)")}
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={status === "loading"}
                        className="px-6 py-3 font-mono font-bold text-xs uppercase tracking-widest transition-all duration-150 disabled:opacity-50 cursor-pointer whitespace-nowrap"
                        style={{
                          background: "var(--clx-btn-bg)",
                          border: "2px solid var(--clx-red)",
                          borderRadius: 0,
                          color: "var(--clx-btn-text)",
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.background = "var(--clx-btn-hover-bg)";
                          (e.currentTarget as HTMLButtonElement).style.color = "var(--clx-btn-hover-text)";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.background = "var(--clx-btn-bg)";
                          (e.currentTarget as HTMLButtonElement).style.color = "var(--clx-btn-text)";
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
                            background: "var(--clx-error-bg)",
                            border: "1px solid var(--clx-error-border)",
                            color: "var(--clx-red)",
                          }}
                        >
                          🔺 {message}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div
                      className="font-mono text-[10px] uppercase tracking-wider flex items-center justify-between mt-2"
                      style={{ color: "var(--clx-text-dim)" }}
                    >
                      <span>Secure early access slot.</span>
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
                  <div className="mb-6">
                    <h2
                      className="font-mono font-bold uppercase mb-2 text-center"
                      style={{
                        fontSize: "clamp(20px, 3.5vw, 30px)",
                        color: "var(--clx-red)",
                        letterSpacing: "0.02em",
                        lineHeight: 1.1,
                      }}
                    >
                      Congratulations!
                    </h2>
                    <h3
                      className="font-mono font-bold uppercase mb-4 text-center"
                      style={{
                        fontSize: "clamp(15px, 2.5vw, 20px)",
                        color: "var(--clx-text)",
                        letterSpacing: "0.02em",
                        lineHeight: 1.2,
                      }}
                    >
                      You have allocated Agent #{waitlistCount !== null ? waitlistCount.toLocaleString() : "..."} for yourself
                    </h3>

                    {/* Compulsory follow warning + buttons */}
                    <div
                      className="mb-6 p-4"
                      style={{
                        border: "2px solid var(--clx-red)",
                        background: "var(--clx-error-bg)",
                      }}
                    >
                      <div
                        className="font-mono text-[10px] uppercase tracking-widest mb-3 flex items-center gap-2"
                        style={{ color: "var(--clx-red)" }}
                      >
                        <span>⚠</span>
                        <span>MANDATORY // FOLLOW TO CONFIRM REGISTRATION</span>
                      </div>
                      <p
                        className="font-mono text-[10px] uppercase leading-relaxed mb-4"
                        style={{ color: "var(--clx-text-muted)", letterSpacing: "0.06em" }}
                      >
                        You must follow us on both platforms to validate your waitlist entry. Unverified registrations will not be processed.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <a
                          href="https://t.me/+qyCCGAanSrYxYmI1"
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 py-3 font-mono font-bold text-xs uppercase tracking-widest text-center transition-all duration-150 flex items-center justify-center gap-2"
                          style={{
                            background: "var(--clx-red)",
                            border: "2px solid var(--clx-red)",
                            color: isLight ? "#fff" : "#000",
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                            (e.currentTarget as HTMLAnchorElement).style.color = "var(--clx-red)";
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLAnchorElement).style.background = "var(--clx-red)";
                            (e.currentTarget as HTMLAnchorElement).style.color = isLight ? "#fff" : "#000";
                          }}
                        >
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                            <path d="M11.944 0C5.344 0 0 5.344 0 12c0 6.656 5.344 12 11.944 12 6.6 0 12-5.344 12-12 0-6.656-5.4-12-12-12zm5.544 8.4l-1.92 9.072c-.144.648-.528.804-1.08.492l-2.928-2.16-1.416 1.368c-.156.156-.288.288-.588.288l.21-2.988 5.436-4.92c.24-.216-.048-.336-.36-.132l-6.72 4.224-2.892-.9c-.636-.204-.648-.636.132-.936l11.292-4.356c.528-.192.984.12.828.948z" />
                          </svg>
                          JOIN TELEGRAM
                        </a>
                        <a
                          href="https://x.com/intent/follow?screen_name=ClawXLabs"
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 py-3 font-mono font-bold text-xs uppercase tracking-widest text-center transition-all duration-150 flex items-center justify-center gap-2"
                          style={{
                            background: "var(--clx-red)",
                            border: "2px solid var(--clx-red)",
                            color: isLight ? "#fff" : "#000",
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                            (e.currentTarget as HTMLAnchorElement).style.color = "var(--clx-red)";
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLAnchorElement).style.background = "var(--clx-red)";
                            (e.currentTarget as HTMLAnchorElement).style.color = isLight ? "#fff" : "#000";
                          }}
                        >
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                          </svg>
                          FOLLOW ON X
                        </a>
                      </div>
                    </div>

                    {/* <p
                      className="font-mono text-[11px] uppercase leading-relaxed mb-6"
                      style={{ color: "var(--clx-text-muted)", letterSpacing: "0.08em" }}
                    >
                      Your registration key has been compiled and secured on the Avalanche network.
                      Share your entry to amplify agent presence and verify your early access allocation.
                    </p> */}

                    {/* <div
                      className="font-mono text-[10px] uppercase tracking-widest mb-1"
                      style={{ color: "var(--clx-text-comment)" }}
                    >
                      Registered Address:
                    </div> */}
                    {/* <div
                      className="font-mono text-xs uppercase tracking-widest mb-6 px-3 py-2"
                      style={{
                        color: "var(--clx-red)",
                        background: "var(--clx-error-bg)",
                        border: "1px solid var(--clx-card-border)",
                      }}
                    >
                      {registeredEmail}
                    </div> */}
                  </div>

                  {/* Dynamic Post Preview (without input editor) */}
                  <div
                    className="p-3 mb-6 font-mono text-[10px] leading-relaxed border border-dashed"
                    style={{
                      borderColor: "var(--clx-card-border)",
                      background: "var(--clx-input-bg)",
                      color: "var(--clx-text-muted)",
                    }}
                  >
                    <div className="text-[8px] uppercase tracking-wider mb-1" style={{ color: "var(--clx-red)" }}>
                      [ PREVIEW // SHARE_INTENT_OUTPUT ]
                    </div>
                    {isCompiling ? "Generating dynamic intent via Gemini..." : (tweetText || "Generating intent...")}
                  </div>

                  <div className="flex flex-col gap-2">
                    <a
                      href={shareUrl || "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-3 font-mono font-bold text-xs uppercase tracking-widest text-center transition-all duration-150"
                      style={{
                        background: "var(--clx-red)",
                        border: "2px solid var(--clx-red)",
                        color: isLight ? "#fff" : "#000",
                        pointerEvents: shareUrl ? "auto" : "none",
                        opacity: shareUrl ? 1 : 0.5,
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                        (e.currentTarget as HTMLAnchorElement).style.color = "var(--clx-red)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLAnchorElement).style.background = "var(--clx-red)";
                        (e.currentTarget as HTMLAnchorElement).style.color = isLight ? "#fff" : "#000";
                      }}
                    >
                      [ SHARE ON X // @CLAWXLABS ]
                    </a>
                    <button
                      onClick={() => {
                        setStatus("idle");
                        setRegisteredEmail("");
                        setShareUrl("");
                        setTweetText("");
                      }}
                      className="w-full font-mono text-[9px] uppercase tracking-widest py-2 transition-colors cursor-pointer"
                      style={{ color: "var(--clx-text-dim)", background: "none", border: "none" }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "var(--clx-red)")}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "var(--clx-text-dim)")}
                    >
                      &gt;_ REGISTER ANOTHER ADDRESS
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Corner pixel accents */}
      {[
        "-top-[3px] -left-[3px]",
        "-top-[3px] -right-[3px]",
        "-bottom-[3px] -left-[3px]",
        "-bottom-[3px] -right-[3px]",
      ].map((pos, i) => (
        <div
          key={i}
          className={`absolute ${pos} w-3 h-3`}
          style={{ background: "var(--clx-red)" }}
        />
      ))}
    </div>
  );
}