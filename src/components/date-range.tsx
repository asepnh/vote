"use client";

import { useSyncExternalStore } from "react";

function subscribe() {
  return () => {};
}

export function DateRange({ start, end }: { start: string; end: string }) {
  const formatted = useSyncExternalStore(
    subscribe,
    () => `${new Date(start).toLocaleString()} → ${new Date(end).toLocaleString()}`,
    () => `${start} → ${end}`,
  );
  return <>{formatted}</>;
}
