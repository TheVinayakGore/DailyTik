"use client";
import { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { format, parseISO } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Pencil, Trash2, CalendarIcon } from "lucide-react";
import { Note } from "@/types/note";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const categories = ["WORK", "PERSONAL", "STUDY", "IDEAS", "PROJECTS", "OTHER"];

export default function NoteCard({
  note,
  onNoteUpdate,
  onNoteDelete,
}: {
  note: Note;
  onNoteUpdate: (updatedNote: Note) => void;
  onNoteDelete: (id: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(note.title);
  const [editContent, setEditContent] = useState(note.content);
  const [editCategory, setEditCategory] = useState(note.category);
  const [editDate, setEditDate] = useState<Date | undefined>(
    note.date ? new Date(note.date) : new Date()
  );
  const [editTags, setEditTags] = useState<string[]>(note.tags);
  const [tagInput, setTagInput] = useState("");

  const handleTagsKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      const newTags = tagInput
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
      setEditTags([...new Set([...editTags, ...newTags])]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setEditTags(editTags.filter((tag) => tag !== tagToRemove));
  };

  const handleUpdate = async () => {
    try {
      const response = await fetch(`/api/notes/${note._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          content: editContent,
          tags: editTags,
          category: editCategory,
          date: editDate,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to update note");

      onNoteUpdate(data);
      setIsEditing(false);
      toast.success("Note updated successfully");
    } catch (error) {
      toast.error(
        `Failed to update note: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/notes/${note._id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete note");
      onNoteDelete(note._id);
      toast.success("Note deleted successfully");
    } catch {
      toast.error("Failed to delete note");
    }
  };

  return (
    <Card className="flex flex-col gap-3 h-full hover:shadow-lg transition-shadow duration-300 ease-in-out">
      <CardHeader className="pb-0">
        <CardTitle className="line-clamp-2">Title : {note.title}</CardTitle>
        {note.content && (
          <CardDescription className="line-clamp-2">
            Desc : {note.content}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="flex-grow py-0">
        <div className="flex items-center text-xs text-muted-foreground pt-2">
          <CalendarIcon className="w-4 h-4 mr-2" />
          <span>
            {note.date
              ? format(parseISO(note.date), "PPP")
              : "No date provided"}
          </span>
        </div>
      </CardContent>

      <CardFooter className="">
        <div className="flex flex-wrap gap-3">
          <Badge className="p-2 px-4 rounded-sm">{note.category}</Badge>
          <div className="flex flex-wrap gap-2 md:gap-3 w-full">
            {note.tags?.map((tag) => (
              <Badge key={tag} variant="outline" className="p-1 px-3 rounded">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex w-full justify-end gap-2">
          <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <Pencil className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Note</DialogTitle>
                <DialogDescription asChild>
                  <div className="space-y-4 py-4">
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Title"
                    />
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      placeholder="Content"
                      rows={5}
                    />
                    <Select
                      value={editCategory}
                      onValueChange={setEditCategory}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {editDate ? (
                            format(editDate, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={editDate}
                          onSelect={setEditDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <div className="space-y-2">
                      <label
                        htmlFor="edit-tags"
                        className="text-sm font-medium"
                      >
                        Tags
                      </label>
                      <div className="flex flex-wrap items-center gap-2 rounded-md border border-input p-2">
                        {editTags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="p-1.5 rounded"
                          >
                            {tag}
                            <button
                              type="button"
                              className="ml-2 outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                              onClick={() => removeTag(tag)}
                            >
                              <span className="sr-only">Remove {tag}</span>
                              &#x2715;
                            </button>
                          </Badge>
                        ))}
                        <Input
                          id="edit-tags"
                          placeholder="Add tags and press Enter..."
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={handleTagsKeyDown}
                          className="flex-1 border-0 h-9 shadow-none focus-visible:ring-0"
                        />
                      </div>
                    </div>
                  </div>
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdate}>Save Changes</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="outline" size="icon" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
