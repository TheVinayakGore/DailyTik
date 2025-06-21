"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Todo = {
  _id: string;
  title: string;
  desc?: string;
  date: string;
  completed: boolean;
};

type TodoFormProps = {
  onAddTodo: (todo: Todo) => void;
  editingTodo?: Todo | null;
  onUpdateTodo?: (todo: Todo) => void;
  onCancelEdit?: () => void;
};

export default function TodoForm({
  onAddTodo,
  editingTodo,
  onUpdateTodo,
  onCancelEdit,
}: TodoFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());

  const isEditMode = !!editingTodo;

  useEffect(() => {
    if (isEditMode) {
      setTitle(editingTodo.title);
      setDesc(editingTodo.desc || "");
      setDate(new Date(editingTodo.date));
    }
  }, [editingTodo, isEditMode]);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (
      selectedDate &&
      new Date(selectedDate) < new Date(new Date().setHours(0, 0, 0, 0))
    ) {
      toast.error("Cannot select a past date.");
      return;
    }
    setDate(selectedDate);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Title is required.");
      return;
    }
    setIsSubmitting(true);

    const todoData = {
      title,
      desc,
      date: date?.toISOString(),
    };

    try {
      const url = isEditMode ? `/api/todos/${editingTodo._id}` : "/api/todos";
      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(todoData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || `Failed to ${isEditMode ? "update" : "add"} todo`
        );
      }

      if (isEditMode && onUpdateTodo) {
        onUpdateTodo(data);
        toast.success("Todo updated successfully!");
      } else {
        onAddTodo(data);
        toast.success("Todo added successfully!");
      }

      setTitle("");
      setDesc("");
      setDate(new Date());
      if (onCancelEdit) onCancelEdit();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "An unknown error occurred."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 w-full max-w-6xl"
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">
            {isEditMode ? "Edit Todo" : "Add New Todo"}
          </CardTitle>
          <CardDescription>
            {isEditMode
              ? "Update your existing task."
              : "Create a new task for your day."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <Input
            name="title"
            placeholder="What needs to be done?"
            required
            className="text-base p-5"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Input
            name="desc"
            placeholder="Add a note (optional)"
            className="text-sm p-5"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="justify-start text-left font-normal p-5 w-full"
              >
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateSelect}
                disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button
            type="submit"
            disabled={isSubmitting || !title.trim()}
            className={`mt-2 md:p-6 text-sm md:text-base ${isEditMode ? "w-1/2" : "w-full"}`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditMode ? "Updating..." : "Adding..."}
              </>
            ) : isEditMode ? (
              "Update Todo"
            ) : (
              "Add Todo"
            )}
          </Button>
          {isEditMode && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancelEdit}
              className="mt-2 md:p-6 text-sm md:text-base w-1/2"
            >
              Cancel
            </Button>
          )}
        </CardFooter>
      </Card>
    </form>
  );
}
