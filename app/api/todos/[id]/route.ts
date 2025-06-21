import { NextResponse } from "next/server";
import Todo from "@/lib/models/Todo";
import { connectToDB } from "@/lib/db";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Connect to database first
    await connectToDB();

    const { id } = await params;
    const { title, desc, completed } = await req.json();
    const update: Partial<{
      title: string;
      desc: string;
      completed: boolean;
    }> = {};

    if (title !== undefined) update.title = title;
    if (desc !== undefined) update.desc = desc;
    if (completed !== undefined) update.completed = completed;

    const todo = await Todo.findByIdAndUpdate(id, update, { new: true });

    if (!todo) {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 });
    }

    return NextResponse.json(todo);
  } catch (error) {
    console.error("Detailed error:", {
      error,
      timestamp: new Date().toISOString(),
    });
    return NextResponse.json(
      {
        error: "Failed to update todo",
        message: error instanceof Error ? error.message : "Unknown error",
        stack:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.stack
              : undefined
            : undefined,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Connect to database first
    await connectToDB();

    const { id } = await params;
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
