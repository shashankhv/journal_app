"use client";
import React, { useState } from "react";
import { setHourStorage } from "../../../../components/storage";
import { useRouter } from "next/navigation";

export default function NewEntryPage() {
  const router = useRouter();
  const todayIso = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(todayIso);
  const [hour, setHour] = useState("12");
  const [text, setText] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const hNum = Number(hour);
    if (isNaN(hNum) || hNum < 0 || hNum > 23) return;
    await setHourStorage(date, hNum, text);
    router.push(`/day?date=${date}`);
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">New Entry</h1>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded border-gray-700 bg-[#16222c]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Hour</label>
          <select
            value={hour}
            onChange={(e) => setHour(e.target.value)}
            className="w-full rounded border-gray-700 bg-[#16222c]"
          >
            {Array.from({ length: 24 }).map((_, h) => (
              <option key={h} value={h}>
                {String(h).padStart(2, "0")}:00
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Text</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
            className="w-full rounded border-gray-700 bg-[#16222c]"
          />
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-white rounded"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border rounded"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
