"use client";
import React, { useState, useEffect, useRef } from "react";
import WeekCard from "@/components/WeekCard";
import LoadingSpinner from "@/components/LoadingSpinner";

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

const months = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
];

function getWeeksInMonth(year: number, month: string) {
  const monthIndex = months.indexOf(month);
  const firstDay = new Date(year, monthIndex, 1);
  const lastDay = new Date(year, monthIndex + 1, 0);

  const weeks = [];
  const start = new Date(firstDay);
  start.setDate(start.getDate() - start.getDay());

  while (start <= lastDay) {
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    if (end > lastDay) end.setDate(lastDay.getDate());

    weeks.push({
      weekNumber: weeks.length + 1,
      startDate: new Date(start),
      endDate: new Date(end),
    });

    start.setDate(start.getDate() + 7);
  }

  return weeks;
}

function isDateInWeek(date: Date, weekStart: Date, weekEnd: Date) {
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);

  const start = new Date(weekStart);
  start.setHours(0, 0, 0, 0);

  const end = new Date(weekEnd);
  end.setHours(23, 59, 59, 999);

  return checkDate >= start && checkDate <= end;
}

export default function AllTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [activeMonth, setActiveMonth] = useState(months[new Date().getMonth()]);
  const [activeWeek, setActiveWeek] = useState<Record<string, number>>(() => {
    const currentDate = new Date();
    const currentMonthStr = months[currentDate.getMonth()];
    const weeksForCurrentMonth = getWeeksInMonth(
      currentDate.getFullYear(),
      currentMonthStr
    );
    const currentWeekIndex = weeksForCurrentMonth.findIndex((week) =>
      isDateInWeek(currentDate, week.startDate, week.endDate)
    );
    return {
      [currentMonthStr]: currentWeekIndex !== -1 ? currentWeekIndex : 0,
    };
  });
  const [initialized, setInitialized] = useState(false);
  const currentYear = new Date().getFullYear();
  
  // Updated ref types to use HTMLElement instead of HTMLDivElement
  const monthRefs = useRef<Record<string, HTMLElement | null>>({});
  const weekRefs = useRef<Record<string, React.RefObject<HTMLElement>[]>>({});

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const res = await fetch("/api/todos");
        const data = await res.json();
        setTodos(data);
      } catch (error) {
        console.error("Failed to fetch todos:", error);
      } finally {
        setInitialized(true);
      }
    };

    fetchTodos();
  }, []);

  const handleTodoUpdate = (updatedTodo: Todo) => {
    setTodos((prev) =>
      prev.map((t) => (t._id === updatedTodo._id ? updatedTodo : t))
    );
  };

  const handleTodoDelete = (id: string) => {
    setTodos((prev) => prev.filter((t) => t._id !== id));
  };

  if (!initialized) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  const isPastMonth = (month: string) => {
    const currentDate = new Date();
    const currentMonthIndex = currentDate.getMonth();
    const monthIndex = months.indexOf(month);
    return monthIndex < currentMonthIndex;
  };

  const isPastWeek = (week: { startDate: Date; endDate: Date }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return week.endDate < today;
  };

  const currentMonth = activeMonth;
  const weeks = getWeeksInMonth(currentYear, currentMonth);

  // Initialize week refs for current month
  if (!weekRefs.current[currentMonth]) {
    weekRefs.current[currentMonth] = weeks.map(() => 
      React.createRef<HTMLElement>()
    );
  }

  const activeWeekIdx = activeWeek[currentMonth] ?? 0;

  const handleWeekClick = (idx: number) => {
    setActiveWeek((prev) => ({ ...prev, [currentMonth]: idx }));
    const ref = weekRefs.current[currentMonth]?.[idx]?.current;
    if (ref) {
      ref.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  // Filter todos for current month
  const monthTodos = todos.filter((todo) => {
    const todoDate = new Date(todo.date);
    return (
      todoDate.getFullYear() === currentYear &&
      months[todoDate.getMonth()] === currentMonth
    );
  });

  // Filter todos for active week
  const activeWeekData = weeks[activeWeekIdx];
  const weekTodos = activeWeekData
    ? monthTodos.filter((todo) => {
        const todoDate = new Date(todo.date);
        return isDateInWeek(
          todoDate,
          activeWeekData.startDate,
          activeWeekData.endDate
        );
      })
    : [];

  // Sort todos by creation time (oldest first)
  weekTodos.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return (
    <main id="todos" className="w-full h-full">
      {/* Month navigation */}
      <nav className="fixed top-14 pt-5 px-2 md:px-5 flex items-center gap-2 md:gap-5 border-b bg-background backdrop-blur-lg overflow-x-auto w-full z-20">
        {months.map((month) => (
          <button
            key={month}
            className={`relative px-2 pb-2 transition-colors focus:outline-none uppercase ${
              isPastMonth(month)
                ? "text-muted-foreground/50"
                : activeMonth === month
                ? "text-primary border-b-2 border-primary text-base md:text-lg font-bold"
                : "text-muted-foreground hover:text-primary text-sm md:text-base font-medium"
            } cursor-pointer`}
            onClick={() => setActiveMonth(month)}
          >
            {month}
            {activeMonth === month && (
              <span className="absolute left-0 right-0 -bottom-[2px] h-[2px] bg-primary rounded-full" />
            )}
          </button>
        ))}
      </nav>

      {/* Week content */}
      <section
        id={currentMonth}
        ref={(el) => {
          if (el) monthRefs.current[currentMonth] = el;
        }}
        className="flex flex-col md:flex-row relative items-start justify-start overflow-auto w-full"
      >
        {/* Week navigation sidebar */}
        <aside className="sticky top-24 left-0 py-0 md:py-6 mt-0 md:mt-28 px-3 md:pr-0 md:pl-5 flex flex-row md:flex-col items-start z-10 bg-background border border-l-0 rounded-none md:rounded-br-3xl w-full md:w-[5rem] h-auto">
          {weeks.map((week, idx) => (
            <button
              key={idx}
              className={`py-3 pt-10 md:py-2 transition-colors text-center md:text-left w-full border-r-none border-b-2 md:border-r-2 ${
                isPastWeek(week)
                  ? "text-muted-foreground/50 border-transparent"
                  : activeWeekIdx === idx
                  ? "border-b-primary border-r-transparent md:border-r-primary md:border-b-transparent text-primary text-xl font-bold"
                  : "border-transparent text-muted-foreground hover:border-muted"
              } cursor-pointer `}
              onClick={() => handleWeekClick(idx)}
            >
              {`W ${idx + 1}`}
            </button>
          ))}
        </aside>

        {/* Week card */}
        <div className="relative left-0 pt-24 md:pt-28 w-full min-h-screen">
          {activeWeekData && (
            <div ref={weekRefs.current[currentMonth]?.[activeWeekIdx] as React.RefObject<HTMLDivElement>}>
              <WeekCard
                weekNumber={activeWeekIdx + 1}
                startDate={activeWeekData.startDate}
                endDate={activeWeekData.endDate}
                todos={weekTodos}
                onTodoUpdate={handleTodoUpdate}
                onTodoDelete={handleTodoDelete}
              />
            </div>
          )}
        </div>
      </section>
    </main>
  );
}