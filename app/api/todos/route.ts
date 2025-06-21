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

    // If date range is provided, filter by date
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
      { error: "Failed to fetch todos" },
      { status: 500 }
    );
  }
}

// Create new todo
export async function POST(req: Request) {
  try {
    await connectToDB();
    const { title, desc, date } = await req.json();

    // Set the date for the new todo
    const todoDate = date ? new Date(date) : new Date();

    // Check if the date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (todoDate < today) {
      return NextResponse.json(
        {
          error: "Cannot create todos for past dates",
          message: "You can only create todos for today or future dates",
        },
        { status: 400 }
      );
    }

    // Check how many todos already exist for this date
    const startOfDay = new Date(todoDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(todoDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingTodosCount = await Todo.countDocuments({
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    // Limit to 2 todos per date
    if (existingTodosCount >= 2) {
      return NextResponse.json(
        {
          error: "Maximum 2 todos allowed per date",
          message: "You can only create up to 2 todos for the same date",
        },
        { status: 400 }
      );
    }

    const todo = await Todo.create({
      title,
      desc,
      date: todoDate,
    });
    return NextResponse.json(todo);
  } catch (error) {
    console.error("POST todo error:", error);
    return NextResponse.json(
      { error: "Failed to create todo" },
      { status: 500 }
    );
  }
}
