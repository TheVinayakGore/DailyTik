import { MetadataRoute } from "next";
import { connectToDB } from "@/lib/db";
import Note from "@/lib/models/Note";
import Todo from "@/lib/models/Todo";

const URL = "https://dailytik-app.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connectToDB();

  const notes = await Note.find().select("_id updatedAt").exec();
  const todos = await Todo.find().select("_id updatedAt").exec();

  const notesUrls = notes.map((note) => ({
    url: `${URL}/notes/${note._id}`,
    lastModified: new Date(note.updatedAt),
  }));

  const todosUrls = todos.map((todo) => ({
    url: `${URL}/todos/${todo._id}`,
    lastModified: new Date(todo.updatedAt),
  }));

  const staticUrls = [
    {
      url: URL,
      lastModified: new Date(),
    },
    {
      url: `${URL}/allnotes`,
      lastModified: new Date(),
    },
    {
      url: `${URL}/alltodos`,
      lastModified: new Date(),
    },
    {
      url: `${URL}/about`,
      lastModified: new Date(),
    },
  ];

  return [...staticUrls, ...notesUrls, ...todosUrls];
}
