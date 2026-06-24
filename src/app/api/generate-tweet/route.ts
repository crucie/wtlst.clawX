import { NextResponse } from "next/server";
import STATIC_TEMPLATES from "@/tweet-templates.json";

export async function POST(request: Request) {
  try {
    // Parse agentNumber and totalCount from body
    const body = await request.json().catch(() => ({}));
    const agentNumber = body.agentNumber ? parseInt(body.agentNumber, 10) : null;
    const totalCount = body.totalCount ? parseInt(body.totalCount, 10) : null;

    // Suffix containing URL and required tags
    const suffix = "\n@avax @AvaLabs @AvaxTeam1 @Team1IND @AvalancheFDN\nJoin Here: https://waitlist.clawxlab.xyz?v=2\n";
    // Max characters allowed for the dynamic content to stay under 280 characters total
    const maxDynamicLength = 280 - suffix.length;

    // Pick a random template from the imported JSON file
    let dynamicText = STATIC_TEMPLATES[Math.floor(Math.random() * STATIC_TEMPLATES.length)];

    // Replace placeholders
    const displayNum = agentNumber ? agentNumber.toLocaleString() : "X";
    const displayTotal = totalCount ? totalCount.toLocaleString() : "X";
    dynamicText = dynamicText.replaceAll("{{num}}", displayNum);
    dynamicText = dynamicText.replaceAll("{{total}}", displayTotal);

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
