import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/ratelimit";

const TWEET_TEMPLATES = [
  "Securing my slot in the ClawX swarm. On-chain prediction markets are evolving on Avalanche. 🔺",
  "Capital meets swarm intelligence. Early access requested for ClawX on Avalanche. 🔺",
  "No sleep. No bias. Just pure prediction signal. Joined the ClawX waitlist. 🔺",
  "Validating prediction models and locking in early access for ClawX on Avalanche. 🔺",
  "The swarm intelligence is waking up. Secured my early access to ClawX prediction market.",
  "AI agents are running predictive simulations on Avalanche. My slot is locked in. 🔺",
  "Prediction markets meet autonomous agent networks. Secured entry for ClawX on Avalanche.",
  "The algorithms are scanning the market. Early access to ClawX is officially granted.",
  "AI-powered forecasting is going live on Avalanche. Secured my spot in the ClawX waitlist. 🔺",
  "Decentralized prediction markets are getting an upgrade. Joined the ClawX agent swarm.",
  "Just secured early access to the next generation of agentic prediction markets.",
  "On-chain prediction models running 24/7. Locked my early access to ClawX. 🔺",
  "Swarm forecasting is the new meta. Secured my agent slot on the ClawX waitlist.",
  "Letting the machine learning models handle the forecasting. Secured my spot.",
  "No human bias, just raw algorithmic consensus. Joined the ClawX waitlist. 🔺",
  "Agentic intelligence running predictive consensus on Avalanche. Early access locked. 🔺",
  "Step into the predictive swarm. Early access spot secured for ClawX on Avalanche.",
  "AI agents are processing predictive probability metrics. Securing entry to ClawX.",
  "The future of forecasting is agentic and on-chain. Joined the ClawX waitlist. 🔺",
  "Unlocking data-driven prediction models with ClawX. Secured my early entry.",
  "The predictive swarm is compiling. Joined the ClawX waitlist on Avalanche. 🔺",
  "Setting up my node in the ClawX forecasting swarm. Early access confirmed.",
  "Autonomous agents, decentralized consensus, predictive accuracy. Early access locked.",
  "Harnessing the power of AI agent prediction models. Joined the ClawX waitlist.",
  "Sharpening the predictive edge with ClawX. Secure access granted. 🔺",
  "AI-agent driven analytics on Avalanche. Locked in early waitlist registration.",
  "The predictions have begun. Secure your access keys for the ClawX swarm.",
  "Decentralized machine intelligence forecasting the future. Waitlist position secured. 🔺"
];

export async function POST(request: Request) {
  try {
    // 1. Rate Limit
    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const rateLimit = await checkRateLimit(ip);

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a minute before generating another tweet." },
        { status: 429 }
      );
    }

    // 2. Generate content (try Gemini API if key is present)
    let dynamicText = "";
    const apiKey = process.env.GEMINI_API_KEY;

    // Suffix containing URL and required tags
    const suffix = "\n\nwaitlist.clawxlab.xyz \n @avax @AvaLabs @AvaxTeam1 @Team1IND @AvalancheFDN";
    // Max characters allowed for the dynamic content to stay under 280 characters total
    const maxDynamicLength = 280 - suffix.length; // 207 characters

    if (apiKey && apiKey !== "your_free_gemini_api_key_here") {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: `Write a short, engaging, cyberpunk/tech-styled waitlist announcement tweet for 'ClawX' (an AI agentic prediction market on Avalanche). The tweet must be under ${maxDynamicLength - 20} characters, contain no links, no hashtags, no generic marketing filler, and NO emojis or icons at all EXCEPT for the red triangle (🔺). Just output the clean text.`
                }]
              }]
            }),
            signal: AbortSignal.timeout(5000) // 5s timeout
          }
        );
        const data = await response.json();
        const textOut = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (textOut) {
          dynamicText = textOut.trim().replace(/[\r\n\"]+/g, "");
          if (dynamicText.length > maxDynamicLength) {
            dynamicText = dynamicText.substring(0, maxDynamicLength - 3) + "...";
          }
        }
      } catch (err) {
        console.warn("⚠️ Gemini generation failed, falling back to static template:", err);
      }
    }

    // Fallback if Gemini failed or key was missing
    if (!dynamicText) {
      dynamicText = TWEET_TEMPLATES[Math.floor(Math.random() * TWEET_TEMPLATES.length)];
    }

    // Ensure template or whatever we got is strictly safe
    if (dynamicText.length > maxDynamicLength) {
      dynamicText = dynamicText.substring(0, maxDynamicLength - 3) + "...";
    }

    const fullTweet = `${dynamicText}${suffix}`;
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(fullTweet)}`;

    return NextResponse.json({
      success: true,
      tweetText: fullTweet,
      shareUrl,
    });
  } catch (error) {
    console.error("Dynamic tweet endpoint error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
