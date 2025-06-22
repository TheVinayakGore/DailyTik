import { Schema, model, models } from "mongoose";

const NoteSchema = new Schema(
  {
    title: { type: String, required: true },
    content: { type: String, default: "" },
    category: {
      type: String,
      required: true,
      enum: ["WORK", "PERSONAL", "STUDY", "IDEAS", "PROJECTS", "OTHER"],
    },
    tags: { type: [String], default: [] },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default models.Note || model("Note", NoteSchema);
