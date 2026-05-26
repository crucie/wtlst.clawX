import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

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
      
      // Simulate database delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      return NextResponse.json({
        success: true,
        message: "Successfully registered on the waitlist (Mock Mode).",
        email: normalizedEmail,
        isMock: true,
      });
    }

    // Connect to database and insert email
    const client = await clientPromise;
    const db = client.db("clawx");
    const collection = db.collection("waitlist");

    // Ensure unique index is configured at database level
    await collection.createIndex({ email: 1 }, { unique: true }).catch((err) => {
      console.warn("Index check/creation warning:", err.message);
    });

    // Check if the email is already registered
    const existingEntry = await collection.findOne({ email: normalizedEmail });
    if (existingEntry) {
      return NextResponse.json({
        success: true,
        message: "You are already on the waitlist!",
        email: normalizedEmail,
        alreadyRegistered: true,
      });
    }

    // Insert record with duplicate key validation
    try {
      await collection.insertOne({
        email: normalizedEmail,
        registeredAt: new Date(),
      });
    } catch (dbError: any) {
      if (dbError.code === 11000) {
        return NextResponse.json({
          success: true,
          message: "You are already on the waitlist!",
          email: normalizedEmail,
          alreadyRegistered: true,
        });
      }
      throw dbError;
    }

    return NextResponse.json({
      success: true,
      message: "Successfully joined the waitlist.",
      email: normalizedEmail,
      isMock: false,
    });
  } catch (error: any) {
    console.error("Waitlist registration failed:", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}
