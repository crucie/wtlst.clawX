import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Waitlist } from "@/models/Waitlist";

// In-memory store for mock registrations during local development/testing
let mockRegistrationsCount = 0;
const mockRegisteredEmails = new Set<string>();
const BASE_WAITLIST_OFFSET = parseInt(process.env.BASE_WAITLIST_OFFSET || "0", 10);

export async function GET() {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json({
        success: true,
        count: BASE_WAITLIST_OFFSET + mockRegistrationsCount,
        isMock: true
      });
    }

    try {
      await dbConnect();
      const dbCount = await Waitlist.countDocuments();

      return NextResponse.json({
        success: true,
        count: BASE_WAITLIST_OFFSET + dbCount,
        isMock: false
      });
    } catch (dbError) {
      console.warn("⚠️ Failed to read waitlist count from database. Using mock fallback:", dbError);
      return NextResponse.json({
        success: true,
        count: BASE_WAITLIST_OFFSET + mockRegistrationsCount,
        isMock: true
      });
    }
  } catch (error: any) {
    console.error("Waitlist GET failed:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
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

    // Graceful fallback to mock mode if MONGODB_URI is not set
    if (!process.env.MONGODB_URI) {
      console.warn("⚠️ MONGODB_URI is not set in environment variables. Operating in Mock Mode.");
      
      if (mockRegisteredEmails.has(normalizedEmail)) {
        return NextResponse.json(
          { error: "This email is already registered. Please use a different email address." },
          { status: 400 }
        );
      }

      mockRegisteredEmails.add(normalizedEmail);
      mockRegistrationsCount++;
      const currentPosition = BASE_WAITLIST_OFFSET + mockRegistrationsCount;

      // Simulate database delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      return NextResponse.json({
        success: true,
        message: "Successfully registered on the waitlist (Mock Mode).",
        email: normalizedEmail,
        position: currentPosition,
        count: currentPosition,
        isMock: true,
      });
    }

    // Connect to database and insert email using Mongoose
    try {
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
        isMock: false,
      });

    } catch (dbConnectError) {
      console.warn("⚠️ Failed to connect to MongoDB. Operating in Mock Mode:", dbConnectError);
      
      if (mockRegisteredEmails.has(normalizedEmail)) {
        return NextResponse.json(
          { error: "This email is already registered. Please use a different email address." },
          { status: 400 }
        );
      }

      mockRegisteredEmails.add(normalizedEmail);
      mockRegistrationsCount++;
      const currentPosition = BASE_WAITLIST_OFFSET + mockRegistrationsCount;

      // Simulate database delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      return NextResponse.json({
        success: true,
        message: "Successfully registered on the waitlist (Mock Mode).",
        email: normalizedEmail,
        position: currentPosition,
        count: currentPosition,
        isMock: true,
      });
    }
  } catch (error: any) {
    console.error("Waitlist registration failed:", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}
