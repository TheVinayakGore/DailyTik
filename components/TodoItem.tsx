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
import {
  Pencil,
  Trash2,
  Check,
  X,
  CalendarIcon,
  Clock,
  Plus,
} from "lucide-react";
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
  DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "./ui/badge";

type SubTodo = {
  title: string;
};

type Todo = {
  _id: string;
  title: string;
  desc?: string;
  date: string;
  completed: boolean;
  createdAt: string;
  subTodos?: SubTodo[];
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
  const [isDialogEditing, setIsDialogEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDesc, setEditDesc] = useState(todo.desc || "");
  const [editDate, setEditDate] = useState<Date>(new Date(todo.date));
  const [editSubTodos, setEditSubTodos] = useState<SubTodo[]>(
    todo.subTodos || []
  );
  const [newSubTodoTitle, setNewSubTodoTitle] = useState("");
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
          subTodos: editSubTodos,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update todo");
      }

      onTodoUpdate(data);
      setIsEditing(false);
      setIsDialogEditing(false);
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

  const addSubTodo = () => {
    if (!newSubTodoTitle.trim()) {
      toast.error("Sub-task title cannot be empty");
      return;
    }
    setEditSubTodos([...editSubTodos, { title: newSubTodoTitle }]);
    setNewSubTodoTitle("");
  };

  const removeSubTodo = (index: number) => {
    setEditSubTodos(editSubTodos.filter((_, i) => i !== index));
  };

  const updateSubTodo = (index: number, newTitle: string) => {
    const updatedSubTodos = [...editSubTodos];
    updatedSubTodos[index].title = newTitle;
    setEditSubTodos(updatedSubTodos);
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

  const startDialogEditing = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditTitle(todo.title);
    setEditDesc(todo.desc || "");
    setEditDate(new Date(todo.date));
    setEditSubTodos(todo.subTodos || []);
    setIsDialogEditing(true);
  };

  const cancelDialogEditing = () => {
    setIsDialogEditing(false);
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
              )} text-white uppercase w-full md:w-auto h-full`}
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
            <CardContent className="flex flex-col sm:flex-row items-start gap-5 pb-4 pl-5 md:-pl-7 py-4 w-full h-full">
              <div className="flex-1 space-y-2">
                {isEditing ? (
                  <div className="w-full">
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Todo title"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <Textarea
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      placeholder="Add a note (optional)"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal mt-2"
                          onClick={(e) => e.stopPropagation()}
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

                    {/* Sub-todos section */}
                    <div className="space-y-2 mt-4">
                      <h4 className="font-medium text-sm">Sub-Tasks</h4>
                      {editSubTodos.map((subTodo, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Input
                            value={subTodo.title}
                            onChange={(e) =>
                              updateSubTodo(index, e.target.value)
                            }
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removeSubTodo(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <div
                        className="flex items-center gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Input
                          placeholder="Add new sub-task"
                          value={newSubTodoTitle}
                          onChange={(e) => setNewSubTodoTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addSubTodo();
                            }
                          }}
                        />
                        <Button type="button" size="icon" onClick={addSubTodo}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="font-medium text-sm md:text-base">
                    <h3
                      className={`${
                        todo.completed
                          ? "line-through text-muted-foreground"
                          : ""
                      }`}
                    >
                      Title : {todo.title}
                    </h3>
                    {todo.desc && <p className="">Desc : {todo.desc}</p>}
                    <p className="text-[0.67rem] opacity-50 mt-2">
                      Created at : {format(parseISO(todo.createdAt), "PPPP p")}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <Button onClick={handleUpdate} size="icon">
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={cancelDialogEditing}
                      variant="outline"
                      size="icon"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <div className="w-full sm:w-auto">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete();
                      }}
                      variant="outline"
                      size="icon"
                      className="hidden sm:flex"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete();
                      }}
                      className="flex sm:hidden w-full"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete</span>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </DialogTrigger>
        <DialogContent className="w-full sm:max-w-xl pb-0">
          <DialogHeader>
            <DialogTitle className="text-2xl text-start leading-none">
              {isDialogEditing ? "Edit Todo" : "Todo Details"}
            </DialogTitle>
            <DialogDescription>
              {isDialogEditing
                ? "Make changes to your todo item here."
                : "Details for the selected todo item."}
            </DialogDescription>
          </DialogHeader>
          {isDialogEditing ? (
            <div className="space-y-4">
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
                    className="w-full justify-start text-left font-normal mt-2"
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
              <div className="space-y-2 mt-4">
                <h4 className="font-medium text-sm">Sub-Tasks</h4>
                {editSubTodos.map((subTodo, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={subTodo.title}
                      onChange={(e) => updateSubTodo(index, e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeSubTodo(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Add new sub-task"
                    value={newSubTodoTitle}
                    onChange={(e) => setNewSubTodoTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSubTodo();
                      }
                    }}
                  />
                  <Button type="button" size="icon" onClick={addSubTodo}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button onClick={cancelDialogEditing} variant="ghost">
                  Cancel
                </Button>
                <Button onClick={handleUpdate}>Save Changes</Button>
              </div>
            </div>
          ) : (
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
                  <>
                    <p className="text-sm md:text-lg font-semibold">
                      # Desc :{" "}
                      <span className="font-medium text-xs md:text-sm">
                        {todo.desc}
                      </span>
                    </p>
                    <Separator />
                  </>
                )}
                {todo.subTodos && todo.subTodos.length > 0 && (
                  <>
                    <div className="space-y-2">
                      <h3 className="text-sm md:text-lg font-semibold">
                        # Sub-Tasks
                      </h3>
                      <ol className="list-decimal flex flex-col items-center gap-2 w-full">
                        {todo.subTodos.map((sub, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="py-2 px-7 text-start w-full"
                          >
                            <li className="text-xs md:text-sm w-full">
                              {sub.title}
                            </li>
                          </Badge>
                        ))}
                      </ol>
                    </div>
                    <Separator />
                  </>
                )}
                <div className="flex gap-3 text-blue-500 text-sm md:text-base">
                  <p className="font-medium rounded-md uppercase">
                    {format(parseISO(todo.date), "EEEE")}
                  </p>
                  <p className="font-medium flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    {format(parseISO(todo.date), "MMMM d, yyyy")}
                  </p>
                  <p className="opacity-80 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {format(parseISO(todo.date), "h:mm a")}
                  </p>
                </div>
                <Separator />
                <div className="flex flex-col items-center gap-3 w-full">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                    <Button
                      onClick={startDialogEditing}
                      size="lg"
                      variant="outline"
                      className="w-full"
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      onClick={() => {
                        setIsDialogOpen(false);
                        handleDelete();
                      }}
                      size="lg"
                      className="w-full"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                  <p className="text-xs opacity-50">
                    Created at: {format(parseISO(todo.createdAt), "PPP p")}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
