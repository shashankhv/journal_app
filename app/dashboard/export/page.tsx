"use client";
import React, { useState } from "react";
import { exportRange } from "../../../components/storage";

export default function ExportPage() {
  const today = new Date().toISOString().slice(0, 10);
  const [start, setStart] = useState(today);
  const [end, setEnd] = useState(today);
  const [includeEmpty, setIncludeEmpty] = useState(false);
  const [markdown, setMarkdown] = useState("");

  async function generate(e: React.FormEvent) {
    e.preventDefault();
    try {
      const md = await exportRange(start, end, includeEmpty);
      setMarkdown(md);
    } catch (err: any) {
      alert(err.message);
    }
  }

  function download() {
    if (!markdown) return;
    const blob = new Blob([markdown], { type: "text/markdown" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `journal-${start.replace(/-/g, "")}-${end.replace(
      /-/g,
      ""
    )}.md`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Export</h1>
      <form onSubmit={generate} className="space-y-4 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Start</label>
            <input
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="w-full rounded border-gray-700 bg-[#16222c]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End</label>
            <input
              type="date"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="w-full rounded border-gray-700 bg-[#16222c]"
            />
          </div>
          <div className="flex items-end">
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={includeEmpty}
                onChange={(e) => setIncludeEmpty(e.target.checked)}
              />{" "}
              Include empty
            </label>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-white rounded"
          >
            Generate
          </button>
          <button
            type="button"
            disabled={!markdown}
            onClick={download}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Download
          </button>
        </div>
      </form>
      {markdown && (
        <div>
          <h2 className="text-lg font-semibold mb-2">Preview</h2>
          <pre className="bg-[#16222c] p-4 rounded overflow-x-auto text-sm whitespace-pre-wrap">
            {markdown}
          </pre>
        </div>
      )}
    </div>
  );
}
