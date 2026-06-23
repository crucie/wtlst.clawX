import mongoose from "mongoose";

const WaitlistSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  joinedAt: { type: Date, default: Date.now },
});

// Counter collection to track total signups
const CounterSchema = new mongoose.Schema({
  _id: { type: String, default: "totalWaitlist" },
  count: { type: Number, default: 0 },
});

export const Waitlist = mongoose.models.Waitlist || mongoose.model("Waitlist", WaitlistSchema);
export const Counter = mongoose.models.Counter || mongoose.model("Counter", CounterSchema);

const TemplateSchema = new mongoose.Schema({
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Template = mongoose.models.Template || mongoose.model("Template", TemplateSchema);

