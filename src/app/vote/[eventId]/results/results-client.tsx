"use client";

import { useEffect, useState } from "react";

type ResultRow = {
  candidate: { id: string; name: string };
  votes: number;
};

export function ResultsClient({
  eventId,
  initialResults,
}: {
  eventId: string;
  initialResults: ResultRow[];
}) {
  const [results, setResults] = useState(initialResults);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/vote/${eventId}/results/api`, {
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          setResults(data.results);
        }
      } catch {
        // ignore transient network errors; next poll will retry
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [eventId]);

  const total = results.reduce((sum, r) => sum + r.votes, 0);

  return (
    <ul className="flex flex-col gap-3">
      {results.map((row) => {
        const pct = total > 0 ? Math.round((row.votes / total) * 100) : 0;
        return (
          <li key={row.candidate.id} className="rounded-md border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">{row.candidate.name}</span>
              <span className="text-sm text-gray-500">
                {row.votes} vote{row.votes === 1 ? "" : "s"} ({pct}%)
              </span>
            </div>
            <div className="mt-2 h-2 w-full rounded-full bg-gray-100">
              <div
                className="h-2 rounded-full bg-gray-900"
                style={{ width: `${pct}%` }}
              />
            </div>
          </li>
        );
      })}
      {results.length === 0 && (
        <p className="text-sm text-gray-500">No candidates in this event.</p>
      )}
    </ul>
  );
}
