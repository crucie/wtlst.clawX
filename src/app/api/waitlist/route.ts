import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Waitlist } from "@/models/Waitlist";

const BASE_WAITLIST_OFFSET = parseInt(process.env.BASE_WAITLIST_OFFSET || "0", 10);

export async function GET() {
  try {
    if (!process.env.MONGODB_URI) {
      console.error("❌ MONGODB_URI is not configured in the environment variables.");
      return NextResponse.json(
        { success: false, error: "Database configuration error." },
        { status: 500 }
      );
    }

    await dbConnect();
    const dbCount = await Waitlist.countDocuments();

    return NextResponse.json({
      success: true,
      count: BASE_WAITLIST_OFFSET + dbCount,
    });
  } catch (error: any) {
    console.error("Waitlist GET failed:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = body.email;

    if (!email || typeof email !== "string" || !email.includes("@") || email.length < 5) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!process.env.MONGODB_URI) {
      console.error("❌ MONGODB_URI is not configured in the environment variables.");
      return NextResponse.json(
        { error: "Database configuration error. Please try again later." },
        { status: 500 }
      );
    }

    await dbConnect();

    // Check if the email is already registered
    const existingEntry = await Waitlist.findOne({ email: normalizedEmail });
    if (existingEntry) {
      return NextResponse.json(
        { error: "This email is already registered. Please use a different email address." },
        { status: 400 }
      );
    }

    // Insert record
    try {
      await Waitlist.create({
        email: normalizedEmail,
        joinedAt: new Date(),
      });
    } catch (dbError: any) {
      if (dbError.code === 11000) {
        return NextResponse.json(
          { error: "This email is already registered. Please use a different email address." },
          { status: 400 }
        );
      }
      throw dbError;
    }

    const dbCount = await Waitlist.countDocuments();
    const currentCount = BASE_WAITLIST_OFFSET + dbCount;

    return NextResponse.json({
      success: true,
      message: "Successfully joined the waitlist.",
      email: normalizedEmail,
      position: currentCount,
      count: currentCount,
    });

  } catch (error: any) {
    console.error("Waitlist registration failed:", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}
