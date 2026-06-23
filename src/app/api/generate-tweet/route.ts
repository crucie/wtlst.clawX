import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/ratelimit";
import clientPromise from "@/lib/mongodb";

const STATIC_TEMPLATES = [
  "Securing my slot as Agent #{{num}} in ClawX early access. On-chain prediction markets are evolving on Avalanche. 🔺",
  "Capital meets agentic intelligence. Agent #{{num}} requested early access for ClawX on Avalanche. 🔺",
  "No sleep. No bias. Just pure prediction signal. Allocated Agent #{{num}} on the ClawX waitlist. 🔺",
  "Validating prediction models and locking in early access as Agent #{{num}} for ClawX on Avalanche. 🔺",
  "Agent #{{num}} allocated. Joined {{num}} early users on the ClawX waitlist on Avalanche. 🔺",
  "AI agents are running predictive simulations on Avalanche. Slot for Agent #{{num}} is locked in. 🔺",
  "Prediction markets meet autonomous agent networks. Secured entry as Agent #{{num}} for ClawX. 🔺",
  "The algorithms are scanning the market. Early access for Agent #{{num}} is officially granted. 🔺",
  "AI-powered forecasting is going live on Avalanche. Secured my spot as Agent #{{num}} in the ClawX waitlist. 🔺",
  "Decentralized prediction markets are getting an upgrade. Joined ClawX early access as Agent #{{num}}. 🔺",
  "Just secured early access as Agent #{{num}} to the next generation of agentic prediction markets on Avalanche. 🔺",
  "On-chain prediction models running 24/7. Locked my early access as Agent #{{num}} for ClawX. 🔺",
  "Agentic forecasting is the new meta. Secured my slot as Agent #{{num}} on the ClawX waitlist. 🔺",
  "Letting the machine learning models handle the forecasting. Secured my spot as Agent #{{num}}. 🔺",
  "No human bias, just raw algorithmic consensus. Joined the ClawX waitlist as Agent #{{num}}. 🔺",
  "Agentic intelligence running predictive consensus on Avalanche. Early access slot Agent #{{num}} locked. 🔺",
  "Step into the predictive arena. Early access spot Agent #{{num}} secured for ClawX on Avalanche. 🔺",
  "AI agents are processing predictive probability metrics. Securing entry as Agent #{{num}} to ClawX. 🔺",
  "The future of forecasting is agentic and on-chain. Joined the ClawX waitlist as Agent #{{num}}. 🔺",
  "Unlocking data-driven prediction models with ClawX. Secured early entry as Agent #{{num}}. 🔺",
  "The predictive engine is compiling. Joined the ClawX waitlist as Agent #{{num}} on Avalanche. 🔺",
  "Setting up my node in the ClawX forecasting network. Early access as Agent #{{num}} confirmed. 🔺",
  "Autonomous agents, decentralized consensus, predictive accuracy. Early access Agent #{{num}} locked. 🔺",
  "Harnessing the power of AI agent prediction models. Joined the ClawX waitlist as Agent #{{num}}. 🔺",
  "Sharpening the predictive edge with ClawX. Secure access as Agent #{{num}} granted. 🔺",
  "AI-agent driven analytics on Avalanche. Locked in early waitlist registration as Agent #{{num}}. 🔺",
  "The predictions have begun. Secure your access keys as Agent #{{num}} for ClawX. 🔺",
  "Decentralized machine intelligence forecasting the future. Waitlist position Agent #{{num}} secured. 🔺"
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

    // Parse agentNumber from body
    const body = await request.json().catch(() => ({}));
    const agentNumber = body.agentNumber ? parseInt(body.agentNumber, 10) : null;

    // Suffix containing URL and required tags
    const suffix = "\n\n@ClawXLabs | waitlist.clawxlab.xyz \n@avax @AvaLabs @AvaxTeam1 @Team1IND @AvalancheFDN";
    // Max characters allowed for the dynamic content to stay under 280 characters total
    const maxDynamicLength = 280 - suffix.length;

    let dynamicText = "";

    // Connect to database and retrieve a single-use template
    if (process.env.MONGODB_URI) {
      try {
        const client = await clientPromise;
        if (client) {
          const db = client.db("clawx");
          const collection = db.collection("templates");

          // Auto-seed collection if empty
          const templateCount = await collection.countDocuments();
          if (templateCount === 0) {
            console.log("Seeding templates collection with initial templates list...");
            await collection.insertMany(
              STATIC_TEMPLATES.map((text) => ({ text, createdAt: new Date() }))
            );
          }

          // Fetch one random template and remove it from DB
          const sample = await collection.aggregate([{ $sample: { size: 1 } }]).toArray();
          if (sample.length > 0) {
            const template = sample[0];
            await collection.deleteOne({ _id: template._id });
            dynamicText = template.text;
          }
        }
      } catch (dbError) {
        console.warn("⚠️ Failed to retrieve template from MongoDB, using static fallback:", dbError);
      }
    }

    // Fallback if DB query was skipped or failed to return a template
    if (!dynamicText) {
      dynamicText = STATIC_TEMPLATES[Math.floor(Math.random() * STATIC_TEMPLATES.length)];
    }

    // Replace {{num}} placeholders with the formatted agent number
    const displayNum = agentNumber ? agentNumber.toLocaleString() : "X";
    dynamicText = dynamicText.replaceAll("{{num}}", displayNum);

    // Ensure final content length is strictly safe
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
