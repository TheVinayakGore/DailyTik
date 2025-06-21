import { NextResponse } from "next/server";
import Note from "@/lib/models/Note";
import { connectToDB } from "@/lib/db";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDB();
    const { id } = params;
    const { title, content, tags, category } = await request.json();

    const update: Partial<{
      title: string;
      content: string;
      tags: string[];
      category: string;
    }> = {};

    if (title !== undefined) update.title = title;
    if (content !== undefined) update.content = content;
    if (tags !== undefined) update.tags = tags;
    if (category !== undefined) update.category = category;

    const note = await Note.findByIdAndUpdate(id, update, { new: true });

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    return NextResponse.json(note);
  } catch (error) {
    console.error("Detailed error:", {
      error,
      timestamp: new Date().toISOString(),
    });
    return NextResponse.json(
      {
        error: "Failed to update note",
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
    const deletedNote = await Note.findByIdAndDelete(id);

    if (!deletedNote) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    return NextResponse.json(deletedNote);
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      {
        error: "Failed to delete note",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
