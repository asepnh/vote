"use client";

import { useEffect, useRef } from "react";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function toLocalInputValue(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// A datetime-local picker that always reflects the viewer's own timezone,
// paired with a hidden field carrying an unambiguous UTC ISO string for the
// server. Needs to be a client component (not an inert injected <script>)
// so it re-runs correctly on Next.js client-side navigations, not just hard
// page loads.
export function DateTimeLocalField({
  name,
  label,
  defaultValueISO,
}: {
  name: string;
  label: string;
  defaultValueISO?: string;
}) {
  const hiddenRef = useRef<HTMLInputElement>(null);
  const pickerRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (defaultValueISO && pickerRef.current) {
      const d = new Date(defaultValueISO);
      if (!Number.isNaN(d.getTime())) {
        pickerRef.current.value = toLocalInputValue(d);
      }
    }

    const form = hiddenRef.current?.form;
    if (!form) return;

    const handleSubmit = () => {
      if (pickerRef.current?.value && hiddenRef.current) {
        hiddenRef.current.value = new Date(pickerRef.current.value).toISOString();
      }
    };

    form.addEventListener("submit", handleSubmit);
    return () => form.removeEventListener("submit", handleSubmit);
  }, [defaultValueISO]);

  return (
    <label className="flex flex-col gap-1 text-sm">
      {label}
      <input type="hidden" name={name} ref={hiddenRef} />
      <input
        type="datetime-local"
        ref={pickerRef}
        required
        className="rounded-md border border-gray-300 px-3 py-2"
      />
    </label>
  );
}
