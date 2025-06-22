import { NextResponse } from "next/server";
import Todo from "@/lib/models/Todo";
import { connectToDB } from "@/lib/db";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDB();
    const { id } = params;
    const { title, desc, date, completed, subTodos } = await request.json();

    const update: Partial<{
      title: string;
      desc: string;
      date: Date;
      completed: boolean;
      subTodos: Array<{ title: string }>;
    }> = {};

    if (title !== undefined) update.title = title;
    if (desc !== undefined) update.desc = desc;
    if (date !== undefined) update.date = new Date(date);
    if (completed !== undefined) update.completed = completed;
    if (subTodos !== undefined) update.subTodos = subTodos;

    const todo = await Todo.findByIdAndUpdate(id, update, { new: true });

    if (!todo) {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 });
    }

    return NextResponse.json(todo);
  } catch (error) {
    console.error("Detailed error:", error);
    return NextResponse.json(
      {
        error: "Failed to update todo",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDB();
    const { id } = params;
    const deletedTodo = await Todo.findByIdAndDelete(id);

    if (!deletedTodo) {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 });
    }

    return NextResponse.json(deletedTodo);
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      {
        error: "Failed to delete todo",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}