"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, CalendarIcon, Plus, Minus } from "lucide-react";
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

type SubTodo = {
  title: string;
};

type Todo = {
  _id: string;
  title: string;
  desc?: string;
  date: string;
  completed: boolean;
  subTodos?: SubTodo[];
};

type TodoFormProps = {
  onAddTodo: (todo: Todo) => void;
  editingTodo?: Todo | null;
  onUpdateTodo?: (todo: Todo) => void;
  onCancelEdit?: () => void;
  existingTodos?: Todo[]; // For checking existing todos on same date
};

export default function TodoForm({
  onAddTodo,
  editingTodo,
  onUpdateTodo,
  onCancelEdit,
  existingTodos = [],
}: TodoFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [subTodos, setSubTodos] = useState<SubTodo[]>([]);
  const [newSubTodo, setNewSubTodo] = useState("");

  const isEditMode = !!editingTodo;

  useEffect(() => {
    if (isEditMode && editingTodo) {
      setTitle(editingTodo.title);
      setDesc(editingTodo.desc || "");
      setDate(new Date(editingTodo.date));
      setSubTodos(editingTodo.subTodos || []);
    } else {
      resetForm();
    }
  }, [editingTodo, isEditMode]);

  const resetForm = () => {
    setTitle("");
    setDesc("");
    setDate(new Date());
    setSubTodos([]);
    setNewSubTodo("");
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) return;

    // Normalize dates for comparison (remove time components)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const selectedDay = new Date(selectedDate);
    selectedDay.setHours(0, 0, 0, 0);

    if (selectedDay < today) {
      toast.error("Cannot select a past date.");
      return;
    }

    setDate(selectedDate);
  };

  const addSubTodo = () => {
    if (!newSubTodo.trim()) {
      toast.error("Sub-todo title cannot be empty");
      return;
    }
    setSubTodos([...subTodos, { title: newSubTodo }]);
    setNewSubTodo("");
  };

  const removeSubTodo = (index: number) => {
    setSubTodos(subTodos.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Title is required.");
      return;
    }

    if (!date) {
      toast.error("Please select a date.");
      return;
    }

    // Check for existing todos on the same date (only in add mode)
    if (!isEditMode) {
      const dateStr = date.toISOString().split('T')[0];
      const hasExistingTodo = existingTodos.some(todo => 
        todo.date.split('T')[0] === dateStr
      );

      if (hasExistingTodo) {
        toast.error("Only one todo allowed per date");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const todoData = {
        title,
        desc,
        date: date.toISOString(),
        subTodos: subTodos.filter(st => st.title.trim())
      };

      const url = isEditMode ? `/api/todos/${editingTodo._id}` : "/api/todos";
      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(todoData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save todo");
      }

      const data = await response.json();

      if (isEditMode && onUpdateTodo) {
        onUpdateTodo(data);
        toast.success("Todo updated successfully!");
      } else {
        onAddTodo(data);
        toast.success("Todo added successfully!");
      }

      if (!isEditMode) {
        resetForm();
      }

      if (onCancelEdit) {
        onCancelEdit();
      }
    } catch (error) {
      console.error("Error saving todo:", error);
      toast.error(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full max-w-6xl">
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
            disabled={isSubmitting}
          />
          <Input
            name="desc"
            placeholder="Add a note (optional)"
            className="text-sm p-5"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            disabled={isSubmitting}
          />
          
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="justify-start text-left font-normal p-5 w-full"
                disabled={isSubmitting}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto p-0 z-50 bg-background">
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateSelect}
                disabled={(date) => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  return date < today;
                }}
                initialFocus
                fromDate={new Date()}
              />
            </PopoverContent>
          </Popover>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Add sub-task"
                value={newSubTodo}
                onChange={(e) => setNewSubTodo(e.target.value)}
                disabled={isSubmitting}
                className="flex-1"
              />
              <Button
                type="button"
                size="icon"
                onClick={addSubTodo}
                disabled={isSubmitting}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {subTodos.length > 0 && (
              <div className="space-y-2 mt-2">
                {subTodos.map((subTodo, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="flex-1 px-3 py-2 border rounded-md">
                      {subTodo.title}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeSubTodo(index)}
                      disabled={isSubmitting}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button
            type="submit"
            disabled={isSubmitting || !title.trim() || !date}
            className={`mt-2 md:p-6 text-sm md:text-base ${
              isEditMode ? "w-1/2" : "w-full"
            }`}
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
              disabled={isSubmitting}
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