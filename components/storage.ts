// Storage helpers for entries: { [date: YYYY-MM-DD]: { [hour: number]: string } }
// Now using SQLite database via API routes

export type DayEntries = { [hour: number]: string };
export type AllEntries = { [date: string]: DayEntries };

export async function getDay(date: string): Promise<DayEntries> {
  if (typeof window === "undefined") return {};
  try {
    const response = await fetch(`/api/entries/day?date=${encodeURIComponent(date)}`);
    if (!response.ok) return {};
    return await response.json();
  } catch {
    return {};
  }
}

export async function setHourStorage(date: string, hour: number, text: string) {
  if (typeof window === "undefined") return;
  try {
    await fetch("/api/entries/set-hour", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, hour, text }),
    });
  } catch (error) {
    console.error("Failed to save entry:", error);
  }
}

export async function setMany(
  date: string,
  entries: { hour: number; text: string }[]
) {
  if (typeof window === "undefined") return;
  try {
    await fetch("/api/entries/set-many", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, entries }),
    });
  } catch (error) {
    console.error("Failed to save entries:", error);
  }
}

export async function getMonthCounts(
  year: number,
  month: number
): Promise<{ [date: string]: number }> {
  if (typeof window === "undefined") return {};
  try {
    const response = await fetch(
      `/api/entries/month-counts?year=${year}&month=${month}`
    );
    if (!response.ok) return {};
    return await response.json();
  } catch {
    return {};
  }
}

export async function exportRange(start: string, end: string, includeEmpty: boolean) {
  const response = await fetch("/api/entries/all");
  if (!response.ok) {
    throw new Error("Failed to fetch entries");
  }
  const all: AllEntries = await response.json();
  
  const s = new Date(start + "T00:00:00");
  const e = new Date(end + "T00:00:00");
  if (isNaN(s.getTime()) || isNaN(e.getTime()) || s > e) {
    throw new Error("Invalid range");
  }
  const mdLines: string[] = [
    "# Journal Export",
    `Range: ${start} to ${end}`,
    "",
  ];
  for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
    const iso = d.toISOString().slice(0, 10);
    const day = all[iso] || {};
    const hours = Object.keys(day);
    if (hours.length || includeEmpty) {
      mdLines.push("", `## ${iso}`);
      for (let h = 0; h < 24; h++) {
        const t = day[h];
        if (t || includeEmpty) {
          mdLines.push("", `### ${String(h).padStart(2, "0")}:00`, t || "");
        }
      }
    }
  }
  return mdLines.join("\n");
}
