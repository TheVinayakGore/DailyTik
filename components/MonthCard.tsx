"use client";
// import { Card } from "@/components/ui/card";
import WeekCard from "./WeekCard";
import { getWeeksInMonth } from "@/lib/utils";

// Local Todo type definition
type Todo = {
  _id: string;
  title: string;
  desc?: string;
  date: string;
  completed: boolean;
  createdAt: string;
};

type MonthCardProps = {
  month: string;
  year: number;
  todos: Todo[];
  onTodoUpdate: (updatedTodo: Todo) => void;
  onTodoDelete: (id: string) => void;
};

export default function MonthCard({
  month,
  year,
  todos,
  onTodoUpdate,
  onTodoDelete,
}: MonthCardProps) {
  const weeks = getWeeksInMonth(year, month);
  const monthTodos = todos.filter((todo) => {
    const todoDate = new Date(todo.date);
    return (
      todoDate.getFullYear() === year &&
      todoDate.toLocaleString("default", { month: "long" }) === month
    );
  });

  // Determine if this month is expired
  const now = new Date();
  const monthIndex = new Date(`${month} 1, ${year}`).getMonth();
  const isExpired =
    year < now.getFullYear() ||
    (year === now.getFullYear() && monthIndex < now.getMonth());

  return (
    <main
      className={`p-4 mb-6 w-full transition-opacity ${
        isExpired ? "opacity-50 pointer-events-none grayscale" : ""
      }`}
    >
      <h2 className="text-xl font-bold mb-4">
        {month} {year}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
        {weeks.map((week, index) => {
          const weekTodos = monthTodos.filter((todo) => {
            const todoDate = new Date(todo.date);
            const todoWeek = getWeekNumber(todoDate);
            return todoWeek === week.weekNumber;
          });

          return (
            <WeekCard
              key={`${month}-week-${index}`}
              weekNumber={index + 1}
              startDate={week.startDate}
              endDate={week.endDate}
              todos={weekTodos}
              onTodoUpdate={onTodoUpdate}
              onTodoDelete={onTodoDelete}
            />
          );
        })}
      </div>
    </main>
  );
}

function getWeekNumber(date: Date) {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}
