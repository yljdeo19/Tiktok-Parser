import mongoose from "mongoose";
import "dotenv/config";
const TikTokSchema = new mongoose.Schema({
  id: String,
  keyword: String,

  desc: String,
  authorUniqueId: String,
  authorNickname: String,
  videoUrl: String,
  playUrl: String,
  cover: String,

  views: Number,
  prevViews: Number,
  lastDeltaViews: Number,

  isAd: Boolean,
  isHot: Boolean,
  isNewVideo: Boolean,

  firstParsedAt: Date,
  lastParsedAt: Date,
}, { versionKey: false });

export const TikTokVideo = mongoose.models.TikTokVideo ||
  mongoose.model("TikTokVideo", TikTokSchema);

let isConnected = false;

export async function connectMongo() {
  if (isConnected) return;

  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("Mongo URI not found in .env");

  await mongoose.connect(uri);
  isConnected = true;

  console.log("📌 MongoDB connected");
}
