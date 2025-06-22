"use client";
import React, { useState, useEffect, useCallback } from "react";
import NoteCard from "@/components/NoteCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { Note } from "@/types/note";

const categories = [
  "ALL",
  "WORK",
  "PERSONAL",
  "STUDY",
  "IDEAS",
  "PROJECTS",
  "OTHER",
];

export default function AllNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotes = useCallback(async () => {
    setIsLoading(true);
    try {
      let url = "/api/notes";
      const params = new URLSearchParams();
      if (activeCategory !== "ALL") {
        params.append("category", activeCategory);
      }
      if (searchQuery) {
        params.append("search", searchQuery);
      }
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const res = await fetch(url, { cache: "no-store" });
      const data = await res.json();
      setNotes(data);
    } catch (error) {
      console.error("Failed to fetch notes:", error);
      setNotes([]);
    } finally {
      setIsLoading(false);
    }
  }, [activeCategory, searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchNotes();
    }, 300); // Debounce search query
    return () => clearTimeout(timer);
  }, [fetchNotes]);

  const handleNoteUpdate = (updatedNote: Note) => {
    setNotes((prev) =>
      prev.map((n) => (n._id === updatedNote._id ? updatedNote : n))
    );
  };

  const handleNoteDelete = (id: string) => {
    setNotes((prev) => prev.filter((n) => n._id !== id));
  };

  return (
    <main className="w-full h-full">
      {/* Header and controls */}
      <div className="fixed top-14 pt-5 px-4 md:px-6 bg-background backdrop-blur-lg w-full z-20 border-b">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 pb-3">
          {/* Category navigation */}
          <nav className="flex items-center gap-2 md:gap-4 py-3 overflow-x-auto w-full">
            {categories.map((category) => (
              <Button
                key={category}
                variant={activeCategory === category ? "default" : "ghost"}
                className="whitespace-nowrap px-3 py-1 rounded-md text-sm"
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </Button>
            ))}
          </nav>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-10 py-2 rounded-md border w-full"
              />
            </div>

            <Link href="/notes/new">
              <Button className="gap-2 w-full sm:w-auto">
                <Plus size={16} />
                New Note
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Notes content */}
      <div className="pt-56 sm:pt-44 md:pt-32 pb-10 px-4 md:px-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner />
          </div>
        ) : notes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-7 pt-10">
            {notes.map((note) => (
              <NoteCard
                key={note._id}
                note={note}
                onNoteUpdate={handleNoteUpdate}
                onNoteDelete={handleNoteDelete}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <p className="text-muted-foreground">
              {searchQuery
                ? "No notes match your search"
                : `No notes in ${activeCategory} category`}
            </p>
            <Link href="/notes/new">
              <Button variant="outline">
                <Plus size={16} className="mr-2" />
                Create a new note
              </Button>
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
