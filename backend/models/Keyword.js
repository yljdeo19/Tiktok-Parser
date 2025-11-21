// backend/models/Keyword.js
import mongoose from "mongoose";

const KeywordSchema = new mongoose.Schema(
  {
    keyword: { type: String, required: true, unique: true },
    enabled: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const Keyword =
  mongoose.models.Keyword || mongoose.model("Keyword", KeywordSchema);

export default Keyword;
