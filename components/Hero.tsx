"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  CalendarIcon,
  CheckCircle,
  ListTodo,
  Pencil,
  Trash2,
  StickyNote,
} from "lucide-react";
import Link from "next/link";
import TodoForm from "@/components/TodoForm";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import NoteCard from "@/components/NoteCard";
import { Note } from "@/types/note";
import { MdOutlineNotes } from "react-icons/md";

type Todo = {
  _id: string;
  title: string;
  desc?: string;
  date: string;
  completed: boolean;
  subTodos?: { title: string }[];
};

export default function Hero() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [todosRes, notesRes] = await Promise.all([
          fetch("/api/todos"),
          fetch("/api/notes"),
        ]);
        const [todosData, notesData] = await Promise.all([
          todosRes.json(),
          notesRes.json(),
        ]);
        setTodos(todosData);
        setNotes(notesData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast.error("Failed to load recent todos and notes.");
      }
    };
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete todo");
      }

      setTodos(todos.filter((todo) => todo._id !== id));
      toast.success("Todo deleted successfully");
    } catch (error) {
      toast.error("Failed to delete todo");
      console.error("Error deleting todo:", error);
    }
  };

  const handleNoteUpdate = (updatedNote: Note) => {
    setNotes(
      notes.map((note) => (note._id === updatedNote._id ? updatedNote : note))
    );
  };

  const handleNoteDelete = (id: string) => {
    setNotes(notes.filter((note) => note._id !== id));
  };

  const handleUpdate = (updatedTodo: Todo) => {
    setTodos(
      todos.map((todo) => (todo._id === updatedTodo._id ? updatedTodo : todo))
    );
    setEditingTodo(null);
    toast.success("Todo updated successfully");
  };

  const handleToggleComplete = async (todo: Todo) => {
    try {
      const updatedStatus = !todo.completed;
      const response = await fetch(`/api/todos/${todo._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          completed: updatedStatus,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update todo status");
      }

      const updatedTodo = await response.json();
      setTodos(todos.map((t) => (t._id === todo._id ? updatedTodo : t)));

      toast.success(
        `Todo marked as ${updatedStatus ? "completed" : "incomplete"}`
      );
    } catch (error) {
      toast.error("Failed to update todo status");
      console.error("Error updating todo status:", error);
    }
  };

  const handleEditClick = (todo: Todo) => {
    setEditingTodo(todo);
    document.getElementById("create")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="space-y-5 md:space-y-10 w-full h-full">
      <section
        id="create"
        className="flex flex-col items-center justify-center gap-5 md:gap-10 w-full"
      >
        <h1 className="text-3xl lg:text-6xl font-extrabold tracking-tight">
          Welcome to <span className="text-orange-400">DailyTik</span>
        </h1>

        <p className="mx-auto w-full md:max-w-2xl text-xs md:text-base text-muted-foreground">
          Organize your tasks. Track your time. Boost your productivity with
          DailyTik - built with ❤️ using Next.js & MongoDB for Faster reloads
          and to store your Data on Cloud.
        </p>

        <div className="grid grid-cols-2 gap-4 w-full max-w-md">
          <Link href="#create">
            <Button size="lg" className="w-full gap-2">
              <ListTodo className="h-5 w-5" />
              Create Task
            </Button>
          </Link>

          <Link href="/notes/new">
            <Button size="lg" className="w-full gap-2">
              <MdOutlineNotes className="h-5 w-5" />
              Create Notes
            </Button>
          </Link>

          <Link href="#recenttodos">
            <Button variant="outline" size="lg" className="w-full gap-2">
              <CheckCircle className="h-5 w-5" />
              Recent Todos
            </Button>
          </Link>

          <Link href="#recentnotes">
            <Button variant="outline" size="lg" className="w-full gap-2">
              <StickyNote className="h-5 w-5" />
              Recent Notes
            </Button>
          </Link>
        </div>
      </section>
      <section className="flex flex-col items-center justify-center m-auto w-full md:max-w-6xl">
        <TodoForm
          onAddTodo={(newTodo) =>
            setTodos((prev) => [newTodo, ...prev].slice(0, 5))
          }
          editingTodo={editingTodo}
          onUpdateTodo={handleUpdate}
          onCancelEdit={() => setEditingTodo(null)}
        />
        {/* Recent 5 Todos */}
        {todos.length > 0 && (
          <div id="recenttodos" className="w-full max-w-6xl pt-20">
            <h1 className="text-3xl font-semibold mb-5">⏰ Recent Todos (5)</h1>
            <ul className="space-y-5">
              {todos.slice(0, 5).map((todo) => (
                <Card key={todo._id}>
                  <li className="flex flex-col">
                    <CardHeader className="flex flex-col sm:flex-row justify-between items-start gap-3 pb-0">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={todo.completed}
                          onCheckedChange={() => handleToggleComplete(todo)}
                          className="h-5 w-5 md:h-7 md:w-7 cursor-pointer rounded-full"
                        />
                        <CardTitle className="hidden sm:flex font-medium text-base md:text-xl">
                          <span className="font-bold">Title : </span>{" "}
                          {todo.title.length > 50
                            ? todo.title.slice(0, 50) + "..."
                            : todo.title}
                        </CardTitle>
                        <CardTitle className="flex sm:hidden font-medium text-base md:text-xl">
                          <span className="font-bold">Title : </span>{" "}
                          {todo.title.length > 20
                            ? todo.title.slice(0, 20) + "..."
                            : todo.title}
                        </CardTitle>
                      </div>
                      <div className="hidden sm:grid grid-cols-2 gap-4">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEditClick(todo)}
                          className="h-8 w-8"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDelete(todo._id)}
                          className="h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="md:ml-10 pb-2">
                      <div className="flex items-center gap-1 md:gap-2 text-sm md:text-base">
                        <span className="font-bold">Date :</span>
                        <CalendarIcon className="h-3 md:h-4 w-3 md:w-4" />
                        <span className="text-xs md:text-sm text-blue-500">
                          {format(parseISO(todo.date), "MMMM d, yyyy")}
                        </span>
                      </div>
                      {todo.desc && (
                        <>
                          <p className="hidden md:block text-sm md:text-base mt-2">
                            <span className="font-bold">Desc :</span>{" "}
                            {todo.desc.length > 50
                              ? todo.desc.slice(0, 50) + "..."
                              : todo.desc}
                          </p>
                          <p className="block md:hidden text-sm md:text-base mt-2">
                            <span className="font-bold">Desc :</span>{" "}
                            {todo.desc.length > 20
                              ? todo.desc.slice(0, 20) + "..."
                              : todo.desc}
                          </p>
                        </>
                      )}
                      {todo.subTodos && todo.subTodos.length > 0 && (
                        <div className="mt-2">
                          <h4 className="font-bold">Sub-Tasks:</h4>
                          <ul className="list-decimal list-inside ml-4">
                            {todo.subTodos.map((sub, index) => (
                              <li key={index} className="text-xs">
                                {sub.title}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="flex flex-col md:flex-row items-start gap-3 md:ml-10 w-full">
                      <span
                        className={`text-sm md:text-base flex items-center gap-2 mt-2 w-1/5 ${
                          todo.completed ? "text-green-500" : "text-blue-500"
                        }`}
                      >
                        {todo.completed ? (
                          <Badge className="bg-green-500 text-white w-full" />
                        ) : (
                          <Badge className="bg-blue-500 text-white w-full" />
                        )}
                      </span>
                      <div className="grid grid-cols-1 sm:hidden gap-2 w-full">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditClick(todo)}
                          className="text-xs w-full"
                        >
                          <Pencil className="h-2 w-2" />
                          <span className="text-sm">Edit</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(todo._id)}
                          className="text-xs w-full"
                        >
                          <Trash2 className="h-2 w-2" />
                          <span className="text-sm">Delete</span>
                        </Button>
                      </div>
                    </CardFooter>
                  </li>
                </Card>
              ))}
            </ul>
          </div>
        )}
        {/* Recent 5 Notes */}
        {notes.length > 0 && (
          <div id="recentnotes" className="w-full max-w-6xl pt-20">
            <h1 className="text-3xl font-semibold mb-5">📝 Recent Notes (5)</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-7">
              {notes.slice(0, 5).map((note) => (
                <NoteCard
                  key={note._id}
                  note={note}
                  onNoteUpdate={handleNoteUpdate}
                  onNoteDelete={handleNoteDelete}
                />
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
