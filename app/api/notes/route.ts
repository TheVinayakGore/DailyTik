import { NextResponse } from "next/server";
import Note from "@/lib/models/Note";
import { connectToDB } from "@/lib/db";
import { FilterQuery } from "mongoose";
import { Note as NoteType } from "@/types/note";

// GET all notes
export async function GET(request: Request) {
  try {
    await connectToDB();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    let query: FilterQuery<NoteType> = {};
    const andConditions = [];

    if (category) {
      andConditions.push({ category: category });
    }

    if (search) {
      andConditions.push({
        $or: [
          { title: { $regex: search, $options: "i" } },
          { content: { $regex: search, $options: "i" } },
          { tags: { $regex: search, $options: "i" } },
          { category: { $regex: search, $options: "i" } },
        ],
      });
    }

    if (andConditions.length > 0) {
      query = { $and: andConditions };
    }

    const notes = await Note.find(query).sort({ updatedAt: -1 });
    return NextResponse.json(notes);
  } catch (error) {
    console.error("GET notes error:", error);
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    );
  }
}

// Create new note
export async function POST(req: Request) {
  try {
    await connectToDB();
    const { title, content, category, tags, date } = await req.json();

    // Validate required fields
    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    if (!category) {
      return NextResponse.json(
        { error: "Category is required" },
        { status: 400 }
      );
    }

    const note = await Note.create({
      title: title.trim(),
      content: content.trim(),
      category: category,
      tags: tags || [],
      date: date ? new Date(date) : new Date(),
    });

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error("POST note error:", error);
    return NextResponse.json(
      { error: "Failed to create note" },
      { status: 500 }
    );
  }
}
