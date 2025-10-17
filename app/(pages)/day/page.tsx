"use client";
import React, { useCallback, useEffect, useState, Suspense } from "react";
import { getDay, setMany } from "../../../components/storage";
import { useSearchParams, useRouter } from "next/navigation";

interface HourState {
  [hour: number]: string;
}

function DayPageContent() {
  const params = useSearchParams();
  const router = useRouter();
  const [date, setDate] = useState(() => initDate(params.get("date")));
  const [entries, setEntries] = useState<HourState>({});
  const [editing, setEditing] = useState<{ [h: number]: boolean }>({});
  const [dirty, setDirty] = useState<{ [h: number]: boolean }>({});
  const [saving, setSaving] = useState(false);

  function initDate(d: string | null) {
    if (d && /^\d{4}-\d{2}-\d{2}$/.test(d)) {
      const parts = d.split("-").map(Number);
      return new Date(parts[0], parts[1] - 1, parts[2]);
    }
    return new Date();
  }

  const displayDate = date.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
    day: "2-digit",
  });
  console.log(displayDate);
  const load = useCallback(async () => {
    const day = await getDay(displayDate);
    setEntries({ ...day });
    setEditing({});
    setDirty({});
  }, [displayDate]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === "s" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        saveAll();
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  function shift(days: number) {
    const n = new Date(date);
    n.setDate(n.getDate() + days);
    setDate(n);
    replaceUrl(n);
  }
  function today() {
    const n = new Date();
    setDate(n);
    replaceUrl(n);
  }

  function replaceUrl(d: Date) {
    const iso = d.toISOString().slice(0, 10);
    router.replace(`/day?date=${iso}`);
  }

  function startEdit(h: number) {
    setEditing((e) => ({ ...e, [h]: true }));
  }
  function finishEdit(h: number) {
    // Just end editing; entries already updated live.
    setEditing((e) => ({ ...e, [h]: false }));
  }
  async function saveAll() {
    const changed = Object.keys(dirty)
      .filter((h) => dirty[Number(h)])
      .map((h) => ({ hour: Number(h), text: entries[Number(h)] || "" }));
    if (!changed.length) return;
    setSaving(true);
    await setMany(displayDate, changed);
    setDirty({});
    setSaving(false);
  }
  const dirtyCount = Object.values(dirty).filter(Boolean).length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => shift(-1)}
            className="p-2 rounded hover:bg-gray-200/10"
          >
            &larr;
          </button>
          <h2 className="text-2xl font-bold">{displayDate}</h2>
          <button
            onClick={() => shift(1)}
            className="p-2 rounded hover:bg-gray-200/10"
          >
            &rarr;
          </button>
          <button
            onClick={() => today()}
            className="px-3 py-1 text-sm border rounded"
          >
            Today
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={saveAll}
            className="px-4 py-2 bg-primary text-white rounded disabled:opacity-50"
            disabled={saving || !dirtyCount}
          >
            {saving
              ? "Saving..."
              : `Save All${dirtyCount ? " (" + dirtyCount + ")" : ""}`}
          </button>
          <a
            href="/dashboard"
            className="border-red-500 border px-4 py-2 text-white rounded"
          >
            Cancel
          </a>

          <a href="/entries/new" className="px-4 py-2 border rounded">
            New Entry
          </a>
        </div>
      </div>
      <div
        className="grid grid-cols-[80px,1fr] border-t border-l border-gray-700"
        style={{ gridAutoRows: "auto" }}
      >
        {Array.from({ length: 24 }).map((_, h) => {
          const editingHour = editing[h];
          return (
            <React.Fragment key={h}>
              <div className="border-b border-r border-gray-700 p-2 text-sm text-right font-medium text-gray-400">
                {String(h).padStart(2, "0")}:00
              </div>
              <div className="border-b border-r border-gray-700 p-0">
                <div
                  className={`min-h-16 group relative ${
                    entries[h] ? "bg-[#1d2c38]" : "bg-[#16222c]"
                  }`}
                >
                  {!editingHour && (
                    <div
                      className="min-h-16 w-full p-2 cursor-text overflow-y-auto text-sm text-gray-200 whitespace-pre-line"
                      onClick={() => startEdit(h)}
                    >
                      {entries[h] || ""}
                    </div>
                  )}
                  {editingHour && (
                    <textarea
                      ref={(el) => {
                        if (el) {
                          el.style.height = "auto";
                          el.style.height = el.scrollHeight + 6 + "px";
                        }
                      }}
                      aria-label={`Hour ${String(h).padStart(2, "0")}`}
                      value={entries[h] || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEntries((prev) => ({ ...prev, [h]: val }));
                        setDirty((prev) => ({ ...prev, [h]: true }));

                        e.target.style.height = "auto";
                        e.target.style.height = e.target.scrollHeight + "px";
                      }}
                      onKeyDown={(e) => {
                        if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                          e.preventDefault();
                          finishEdit(h);
                        }
                      }}
                      className="w-full h-[-webkit-fill-available] p-2 text-sm outline-none bg-[#1d2c38] text-gray-200 resize-none overflow-hidden"
                      style={{ minHeight: "64px" }}
                    />
                  )}
                  {dirty[h] && (
                    <div className="absolute top-1 right-1 text-xs text-gray-400">
                      *modified
                    </div>
                  )}
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

export default function DayPage() {
  return (
    <Suspense fallback={<div className="max-w-5xl mx-auto px-4 py-8">Loading...</div>}>
      <DayPageContent />
    </Suspense>
  );
}
