import { Schema, model, models } from "mongoose";

const TodoSchema = new Schema(
  {
    title: { type: String, required: true },
    desc: { type: String, default: "" },
    date: { type: Date, default: Date.now }, // Ensure date field exists
    completed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default models.Todo || model("Todo", TodoSchema);
