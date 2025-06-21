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

export default function TodoForm({ onAddTodo }: TodoFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [hasTodoForDate, setHasTodoForDate] = useState(false);

  // Check if selected date already has a todo
  const checkTodoForDate = async (selectedDate: Date) => {
    try {
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const response = await fetch(
        `/api/todos?startDate=${startOfDay.toISOString()}&endDate=${endOfDay.toISOString()}`
      );
      if (response.ok) {
        const todos = await response.json();
        setHasTodoForDate(todos.length > 0);
      }
    } catch (error) {
      console.error("Error checking todos for date:", error);
    }
  };

  // Update todo check when date changes
  useEffect(() => {
    if (date) {
      checkTodoForDate(date);
    }
  }, [date]);

  // Check if selected date is in the past
  const isPastDate = (selectedDate: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate < today;
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate && isPastDate(selectedDate)) {
      toast.error("Cannot add todos for past dates");
      return;
    }
    setDate(selectedDate);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    try {
      const response = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.get("title"),
          desc: formData.get("desc"),
          date: date ? date.toISOString() : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error for todo limit
        if (
          response.status === 400 &&
          data.error === "Maximum 1 todo allowed per date"
        ) {
          toast.error(data.message || "Maximum 1 todo allowed per date");
        } else if (
          response.status === 400 &&
          data.error === "Cannot create todos for past dates"
        ) {
          toast.error(data.message || "Cannot create todos for past dates");
        } else {
          throw new Error(data.error || "Failed to add todo");
        }
        return;
      }

      onAddTodo(data);
      form.reset();
      setTitle("");
      setDate(new Date());
      toast.success("Todo added successfully!");

      // Refresh todo check for the date
      if (date) {
        checkTodoForDate(date);
      }
    } catch {
      toast.error("Failed to add todo");
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
          <CardTitle className="text-2xl font-semibold">Add New Todo</CardTitle>
          <CardDescription>Create a new task for your day</CardDescription>
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
                disabled={(date) => isPastDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            disabled={
              isSubmitting ||
              !title.trim() ||
              hasTodoForDate ||
              (date ? isPastDate(date) : false)
            }
            className="mt-2 md:p-6 text-sm md:text-base w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              "Add Todo"
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}