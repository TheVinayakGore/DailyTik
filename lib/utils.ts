import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  startOfMonth,
  endOfMonth,
  eachWeekOfInterval,
  endOfWeek,
  isSameMonth,
} from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Week = {
  weekNumber: number;
  startDate: Date;
  endDate: Date;
};

export function getWeeksInMonth(year: number, monthName: string): Week[] {
  const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth();
  const monthStart = startOfMonth(new Date(year, monthIndex));
  const monthEnd = endOfMonth(new Date(year, monthIndex));

  const weeks = eachWeekOfInterval(
    { start: monthStart, end: monthEnd },
    { weekStartsOn: 1 } // Monday
  );

  return weeks.map((weekStart, index) => {
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
    return {
      weekNumber: index + 1,
      startDate: isSameMonth(weekStart, monthStart) ? weekStart : monthStart,
      endDate: isSameMonth(weekEnd, monthEnd) ? weekEnd : monthEnd,
    };
  });
}
