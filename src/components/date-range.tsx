"use client";

export function DateRange({ start, end }: { start: string; end: string }) {
  return (
    <span suppressHydrationWarning>
      {new Date(start).toLocaleString()} → {new Date(end).toLocaleString()}
    </span>
  );
}
