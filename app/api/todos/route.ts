import { NextResponse } from "next/server";
import Todo from "@/lib/models/Todo";
import { connectToDB } from "@/lib/db";

// GET all todos
export async function GET(request: Request) {
  try {
    await connectToDB();

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    let query = {};

    if (startDate && endDate) {
      query = {
        date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      };
    }

    const todos = await Todo.find(query).sort({ createdAt: -1 });
    return NextResponse.json(todos);
  } catch (error) {
    console.error("GET todos error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch todos",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Create new todo
export async function POST(req: Request) {
  try {
    await connectToDB();
    const { title, desc, date, subTodos } = await req.json();

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const todoDate = date ? new Date(date) : new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (todoDate < today) {
      return NextResponse.json(
        { error: "Cannot create todos for past dates" },
        { status: 400 }
      );
    }

    // Check for existing todos on the same date
    const startOfDay = new Date(todoDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(todoDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingTodoCount = await Todo.countDocuments({
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    if (existingTodoCount >= 1) {
      return NextResponse.json(
        { error: "Only one todo allowed per date" },
        { status: 400 }
      );
    }

    const todo = await Todo.create({
      title,
      desc,
      date: todoDate,
      subTodos: subTodos || [],
    });

    return NextResponse.json(todo);
  } catch (error) {
    console.error("POST todo error:", error);
    return NextResponse.json(
      {
        error: "Failed to create todo",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
