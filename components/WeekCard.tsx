"use client";
// import { Card } from "@/components/ui/card";
import TodoItem from "./TodoItem";
import { format, parseISO } from "date-fns";

type Todo = {
  _id: string;
  title: string;
  desc?: string;
  date: string;
  completed: boolean;
  createdAt: string;
};

type WeekCardProps = {
  weekNumber: number;
  startDate: Date;
  endDate: Date;
  todos: Todo[];
  onTodoUpdate: (updatedTodo: Todo) => void;
  onTodoDelete: (id: string) => void;
};

export default function WeekCard({
  endDate,
  todos,
  onTodoUpdate,
  onTodoDelete,
}: WeekCardProps) {
  // Check if this week is in the past
  const isPastWeek = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return endDate < today;
  };

  const past = isPastWeek();

  // Group todos by date
  const todosByDate = todos.reduce((acc, todo) => {
    const todoDate = parseISO(todo.date);
    const dateKey = format(todoDate, "yyyy-MM-dd");

    if (!acc[dateKey]) {
      acc[dateKey] = {
        date: todoDate,
        todos: [],
      };
    }
    acc[dateKey].todos.push(todo);
    return acc;
  }, {} as Record<string, { date: Date; todos: Todo[] }>);

  // Sort dates chronologically
  const sortedDates = Object.values(todosByDate).sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );

  return (
    <main
      className={`p-3 md:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 w-full min-h-60 ${
        past ? "opacity-80" : ""
      }`}
    >
      {past ? (
        <div className="text-center p-10 border rounded-xl">
          <p className="text-sm text-muted-foreground mb-2">
            This week has expired
          </p>
          <p className="text-xs text-muted-foreground">
            You can view existing todos but cannot add new ones
          </p>
        </div>
      ) : sortedDates.length > 0 ? (
        sortedDates.map(({ date, todos }) => (
          <div key={date.toString()} className="space-y-3 h-full">
            {todos.map((todo) => (
              <TodoItem
                key={todo._id}
                todo={todo}
                onTodoUpdate={onTodoUpdate}
                onTodoDelete={onTodoDelete}
                isPast={past}
              />
            ))}
          </div>
        ))
      ) : (
        <p className="text-lg text-muted-foreground p-10 border rounded-xl">
          No tasks this week
        </p>
      )}
    </main>
  );
}
