"use client";
import React, { useEffect, useState } from "react";
import { getMonthCounts } from "./storage";
import { useRouter } from "next/navigation";

interface DayCell {
  date: string; // YYYY-MM-DD or pad
  day: number | "";
  count: number | null;
  isToday?: boolean;
}

export default function Calendar() {
  const [date, setDate] = useState(() => new Date());
  const [days, setDays] = useState<DayCell[]>([]);
  const router = useRouter();

  const year = date.getFullYear();
  const month = date.getMonth() + 1; // 1-12

  useEffect(() => {
    async function loadCounts() {
      const counts = await getMonthCounts(year, month);
      const first = new Date(year, month - 1, 1);
      const startDay = first.getDay();
      const dim = new Date(year, month, 0).getDate();
      const arr: DayCell[] = [];
      for (let i = 0; i < startDay; i++)
        arr.push({ date: "pad" + i, day: "", count: null });
      for (let d = 1; d <= dim; d++) {
        const dt = new Date(year, month - 1, d);
        const iso = dt.toISOString().slice(0, 10);
        arr.push({
          date: iso,
          day: d,
          count: counts[iso] || 0,
          isToday: iso === new Date().toISOString().slice(0, 10),
        });
      }
      setDays(arr);
    }
    loadCounts();
  }, [year, month]);

  const monthLabel = date.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  function shift(m: number) {
    const n = new Date(date);
    n.setMonth(n.getMonth() + m);
    setDate(n);
  }
  function goToday() {
    setDate(new Date());
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => shift(-1)}
            className="p-2 rounded hover:bg-gray-200/10"
          >
            &larr;
          </button>
          <h2 className="text-3xl font-bold">{monthLabel}</h2>
          <button
            onClick={() => shift(1)}
            className="p-2 rounded hover:bg-gray-200/10"
          >
            &rarr;
          </button>
          <button
            onClick={goToday}
            className="px-3 py-1 text-sm border rounded"
          >
            Today
          </button>
        </div>
        <a href="/day" className="px-4 py-2 border rounded">
          Day View
        </a>
      </div>
      <div className="grid grid-cols-7 text-xs font-medium text-gray-500 mb-2">
        <div>Sun</div>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {days.map((d) => {
          const cls = d.day
            ? d.isToday
              ? "border-primary ring-2 ring-primary/60 bg-gradient-to-br from-primary/20 to-primary/5 text-primary font-semibold"
              : "border-gray-700 hover:border-primary hover:bg-primary/10 bg-[#16222c]"
            : "border-transparent bg-transparent cursor-default";
          return (
            <button
              key={d.date}
              disabled={!d.day}
              onClick={() => d.day && router.push(`/day?date=${d.date}`)}
              className={`flex flex-col h-24 p-2 rounded border relative transition-colors group text-left w-full ${cls}`}
            >
              <div className="flex items-center gap-2">
                <div className="text-sm">{d.day}</div>
                {d.count ? (
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <div className="w-1 h-1 bg-primary rounded-full"></div>
                    {d.count}
                  </div>
                ) : null}
              </div>
              {d.isToday && (
                <div className="absolute top-1 right-1 text-[10px] uppercase tracking-wide bg-primary text-white px-1.5 py-0.5 rounded">
                  Today
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
