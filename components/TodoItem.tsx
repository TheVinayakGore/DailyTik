"use client";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Pencil, Trash2, Check, X, CalendarIcon, Clock } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Card, CardContent } from "./ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

type Todo = {
  _id: string;
  title: string;
  desc?: string;
  date: string;
  completed: boolean;
  createdAt: string;
};

const getDayColor = (date: string) => {
  const day = format(parseISO(date), "EEE").toLowerCase();
  switch (day) {
    case "mon":
      return "bg-red-500";
    case "tue":
      return "bg-orange-500";
    case "wed":
      return "bg-yellow-500";
    case "thu":
      return "bg-green-500";
    case "fri":
      return "bg-blue-500";
    case "sat":
      return "bg-indigo-500";
    case "sun":
      return "bg-violet-500";
    default:
      return "bg-gray-500";
  }
};

export default function TodoItem({
  todo,
  onTodoUpdate,
  onTodoDelete,
  isPast = false,
}: {
  todo: Todo;
  onTodoUpdate: (updatedTodo: Todo) => void;
  onTodoDelete: (id: string) => void;
  isPast?: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDesc, setEditDesc] = useState(todo.desc || "");
  const [editDate, setEditDate] = useState<Date>(new Date(todo.date));
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleUpdate = async () => {
    try {
      const response = await fetch(`/api/todos/${todo._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: editTitle,
          desc: editDesc,
          date: editDate.toISOString(),
          completed: todo.completed,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update todo");
      }

      onTodoUpdate(data);
      setIsEditing(false);
      toast.success("Todo updated successfully");
    } catch (error) {
      console.error("Update error details:", error);
      toast.error(
        `Failed to update todo: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/todos/${todo._id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete todo");
      }

      onTodoDelete(todo._id);
      toast.success("Todo deleted successfully");
    } catch (error) {
      toast.error("Failed to delete todo");
      console.error("Error deleting todo:", error);
    }
  };

  const toggleComplete = async (checked: boolean) => {
    try {
      const response = await fetch(`/api/todos/${todo._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          completed: checked,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update todo status");
      }

      const updatedTodo = await response.json();
      onTodoUpdate(updatedTodo);

      toast.success(
        `Todo "${todo.title}" has been ${
          checked ? "completed" : "marked incomplete"
        }`
      );
    } catch (error) {
      toast.error("Failed to update todo status");
      console.error("Error updating todo status:", error);
    }
  };

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger className="flex items-start text-start w-full" asChild>
          <Card
            className={`cursor-pointer ${
              todo.completed ? "opacity-70" : ""
            } border-[1px] flex-col md:flex-row items-start py-0 w-full h-auto`}
          >
            <div
              className={`flex flex-row md:flex-col items-center justify-center gap-2 text-sm md:text-base font-medium md:gap-0 py-3 md:px-5 rounded-t-lg md:rounded-l-lg md:rounded-t-none ${getDayColor(
                todo.date
              )} text-white uppercase w-full md:w-auto h-auto`}
            >
              <Checkbox
                checked={todo.completed}
                onCheckedChange={(checked) =>
                  toggleComplete(checked as boolean)
                }
                disabled={isPast}
                className="h-5 w-5 sm:w-10 md:mb-2 cursor-pointer rounded-full"
                onClick={(e) => e.stopPropagation()}
              />
              <span className="hidden md:flex">
                {format(parseISO(todo.date), "EEE")}
              </span>
              <span className="block md:hidden">
                {format(parseISO(todo.date), "EEEE")}
              </span>
              <span className="text-base md:text-lg font-bold">
                {format(parseISO(todo.date), "d")}
              </span>
            </div>
            <CardContent className="flex flex-col sm:flex-row items-start gap-5 pb-4 md:-ml-7 md:py-4 w-full h-full">
              <div className="flex-1 space-y-2">
                {isEditing ? (
                  <>
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Todo title"
                    />
                    <Textarea
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      placeholder="Add a note (optional)"
                    />
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
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
                          onSelect={(date) => date && setEditDate(date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button
                        size="lg"
                        onClick={handleUpdate}
                        className="w-full"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Save Update
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => setIsEditing(false)}
                        className="w-full"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </>
                ) : (
                  <div>
                    <p
                      className={`text-base md:text-lg ${
                        todo.completed
                          ? "line-through text-muted-foreground"
                          : ""
                      }`}
                    >
                      <span className="font-bold">Title:</span>{" "}
                      {todo.title.length > 16
                        ? todo.title.slice(0, 16) + "..."
                        : todo.title}
                    </p>
                    {todo.desc && (
                      <p
                        className={`text-base md:text-lg ${
                          todo.completed
                            ? "line-through text-muted-foreground"
                            : ""
                        }`}
                      >
                        <span className="font-bold">Desc:</span>{" "}
                        {todo.desc.length > 16
                          ? todo.desc.slice(0, 16) + "..."
                          : todo.desc}
                      </p>
                    )}
                  </div>
                )}
              </div>
              {!isEditing && !isPast && (
                <>
                  <div className="hidden sm:grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsEditing(true);
                      }}
                      disabled={isPast}
                    >
                      <Pencil className="h-3 md:h-4 w-3 md:w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete();
                      }}
                      disabled={isPast}
                    >
                      <Trash2 className="h-3 md:h-4 w-3 md:w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 sm:hidden gap-2 w-full">
                    <Button
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsEditing(true);
                      }}
                      disabled={isPast}
                      className="w-full"
                    >
                      <Pencil className="h-2 w-2" />
                      <span className="text-sm">Edit</span>
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete();
                      }}
                      disabled={isPast}
                      className="w-full"
                    >
                      <Trash2 className="h-2 w-2" />
                      <span className="text-sm">Delete</span>
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </DialogTrigger>
        <DialogContent className="w-full sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl text-start leading-none">
              Todo Details
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 pb-4">
            <Separator />
            <div className="space-y-4">
              <h3 className="text-sm md:text-lg font-semibold">
                # Title :{" "}
                <span className="font-medium text-xs md:text-sm">
                  {todo.title}
                </span>
              </h3>

              <Separator />

              {todo.desc && (
                <p className="text-sm md:text-lg font-semibold">
                  # Desc :{" "}
                  <span className="font-medium text-xs md:text-sm">
                    {todo.desc}
                  </span>
                </p>
              )}

              <Separator />

              <div className="flex flex-col gap-3 text-sm md:text-base">
                <span
                  className={`p-2 px-3 text-white font-medium rounded-md ${getDayColor(
                    todo.date
                  )} uppercase`}
                >
                  {format(parseISO(todo.date), "EEEE")}
                </span>
                <div className="flex items-center gap-3">
                  <p className="font-medium flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    {format(parseISO(todo.date), "MMMM d, yyyy")}
                  </p>
                  <p className="opacity-80 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {format(parseISO(todo.date), "h:mm a")}
                  </p>
                </div>
              </div>

              <Separator />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="w-full"
            >
              Close
            </Button>
            <Button
              onClick={() => {
                setIsDialogOpen(false);
                setIsEditing(true);
              }}
              className="w-full"
            >
              Edit Todo
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
