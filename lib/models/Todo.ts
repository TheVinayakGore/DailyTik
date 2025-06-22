import { Schema, model, models } from "mongoose";

const SubTodoSchema = new Schema({
  title: { type: String, required: true },
});

const TodoSchema = new Schema(
  {
    title: { type: String, required: true },
    desc: { type: String, default: "" },
    date: { type: Date, default: Date.now },
    completed: { type: Boolean, default: false },
    subTodos: [{
      title: String
    }],
  },
  { timestamps: true }
);

export default models.Todo || model("Todo", TodoSchema);