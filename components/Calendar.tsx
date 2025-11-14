"use client";
import React, { useEffect, useState } from "react";
import { getMonthCounts } from "./storage";
import { useRouter } from "next/navigation";

interface DayCell {
  date: string;
  day: number | "";
  count: number | null;
  isToday?: boolean;
}

interface CalendarHeaderProps {
  label: string;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
}

interface CalendarGridProps {
  days: DayCell[];
  onDayClick: (dateString: string) => void;
}

interface DayCellProps {
  dayCell: DayCell;
  onClick: () => void;
}

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [dayCells, setDayCells] = useState<DayCell[]>([]);
  const router = useRouter();

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  useEffect(() => {
    loadMonthData();
  }, [currentYear, currentMonth]);

  async function loadMonthData() {
    const counts = await getMonthCounts(currentYear, currentMonth);
    const cells = generateCalendarCells(currentYear, currentMonth, counts);
    setDayCells(cells);
  }

  function generateCalendarCells(
    year: number,
    month: number,
    counts: Record<string, number>
  ): DayCell[] {
    const firstDayOfMonth = new Date(year, month - 1, 1);
    const startDayOfWeek = firstDayOfMonth.getDay();
    const daysInMonth = new Date(year, month, 0).getDate();
    const todayString = formatDateToISO(new Date());

    const cells: DayCell[] = [];

    console.log(counts, "this is the shot");

    // Add empty cells for days before month starts
    for (let i = 0; i < startDayOfWeek; i++) {
      cells.push({ date: `pad-${i}`, day: "", count: null });
    }

    // Add cells for each day in the month
    for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
      const dateString = formatDateToISO(new Date(year, month - 1, dayNum));
      cells.push({
        date: dateString,
        day: dayNum,
        count: counts[dateString] || 0,
        isToday: dateString === todayString,
      });
    }

    return cells;
  }

  function formatDateToISO(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function navigateMonth(monthOffset: number) {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + monthOffset);
    setCurrentDate(newDate);
  }

  function goToToday() {
    setCurrentDate(new Date());
  }

  function handleDayClick(dateString: string) {
    router.push(`/dashboard/day?date=${dateString}`);
  }

  const monthYearLabel = currentDate.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  return (
    <div>
      <CalendarHeader
        label={monthYearLabel}
        onPrevMonth={() => navigateMonth(-1)}
        onNextMonth={() => navigateMonth(1)}
        onToday={goToToday}
      />

      <WeekdayHeader />

      <CalendarGrid days={dayCells} onDayClick={handleDayClick} />
    </div>
  );
}

function CalendarHeader({
  label,
  onPrevMonth,
  onNextMonth,
  onToday,
}: CalendarHeaderProps) {
  return (
    <div className="mb-8 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={onPrevMonth}
          className="p-2 rounded hover:bg-gray-200/10"
          aria-label="Previous month"
        >
          &larr;
        </button>
        <h2 className="text-3xl font-bold">{label}</h2>
        <button
          onClick={onNextMonth}
          className="p-2 rounded hover:bg-gray-200/10"
          aria-label="Next month"
        >
          &rarr;
        </button>
        <button onClick={onToday} className="px-3 py-1 text-sm border rounded">
          Today
        </button>
      </div>
      <a href="/dashboard/day" className="px-4 py-2 border rounded">
        Day View
      </a>
    </div>
  );
}

function WeekdayHeader() {
  return (
    <div className="grid grid-cols-7 text-xs font-medium text-gray-500 mb-2">
      {DAYS_OF_WEEK.map((day) => (
        <div key={day}>{day}</div>
      ))}
    </div>
  );
}

function CalendarGrid({ days, onDayClick }: CalendarGridProps) {
  return (
    <div className="grid grid-cols-7 gap-2">
      {days.map((dayCell) => (
        <DayCell
          key={dayCell.date}
          dayCell={dayCell}
          onClick={() => onDayClick(dayCell.date)}
        />
      ))}
    </div>
  );
}

function DayCell({ dayCell, onClick }: DayCellProps) {
  const { day, count, isToday } = dayCell;

  if (!day) {
    return <div className="h-24" />;
  }

  const cellStyles = getDayCellStyles(isToday);

  return (
    <button onClick={onClick} className={cellStyles}>
      <div className="flex items-center gap-2">
        <div className="text-sm">{day}</div>
        {typeof count === "number" && count > 0 && (
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <div className="w-1 h-1 bg-primary rounded-full" />
            {count}
          </div>
        )}
      </div>
      {isToday && (
        <div className="absolute top-1 right-1 text-[10px] uppercase tracking-wide bg-primary text-white px-1.5 py-0.5 rounded">
          Today
        </div>
      )}
    </button>
  );
}

function getDayCellStyles(isToday: boolean | undefined): string {
  const baseStyles =
    "flex flex-col h-24 p-2 rounded border relative transition-colors group text-left w-full";

  if (isToday) {
    return `${baseStyles} border-primary ring-2 ring-primary/60 bg-gradient-to-br from-primary/20 to-primary/5 text-primary font-semibold`;
  }

  return `${baseStyles} border-gray-700 hover:border-primary hover:bg-primary/10 bg-[#16222c]`;
}
