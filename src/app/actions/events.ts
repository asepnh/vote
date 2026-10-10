"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { candidates, events } from "@/db/schema";

function parseDateTime(value: FormDataEntryValue | null): Date {
  if (typeof value !== "string" || !value) {
    throw new Error("Missing date/time value");
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid date/time value");
  }
  return date;
}

export async function createEvent(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const startsAt = parseDateTime(formData.get("startsAt"));
  const endsAt = parseDateTime(formData.get("endsAt"));

  if (!title) throw new Error("Title is required");
  if (endsAt <= startsAt) throw new Error("End time must be after start time");

  const [created] = await db
    .insert(events)
    .values({ title, description: description || null, startsAt, endsAt })
    .returning({ id: events.id });

  revalidatePath("/admin");
  redirect(`/admin/events/${created.id}`);
}

export async function updateEvent(eventId: string, formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const startsAt = parseDateTime(formData.get("startsAt"));
  const endsAt = parseDateTime(formData.get("endsAt"));

  if (!title) throw new Error("Title is required");
  if (endsAt <= startsAt) throw new Error("End time must be after start time");

  await db
    .update(events)
    .set({ title, description: description || null, startsAt, endsAt })
    .where(eq(events.id, eventId));

  revalidatePath(`/admin/events/${eventId}`);
  revalidatePath("/admin");
}

export async function deleteEvent(eventId: string) {
  await db.delete(events).where(eq(events.id, eventId));
  revalidatePath("/admin");
  redirect("/admin");
}

export async function addCandidate(eventId: string, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const cvUrl = String(formData.get("cvUrl") ?? "").trim();

  if (!name) throw new Error("Candidate name is required");

  await db.insert(candidates).values({
    eventId,
    name,
    description: description || null,
    cvUrl: cvUrl || null,
  });

  revalidatePath(`/admin/events/${eventId}`);
}

export async function deleteCandidate(eventId: string, candidateId: string) {
  await db.delete(candidates).where(eq(candidates.id, candidateId));
  revalidatePath(`/admin/events/${eventId}`);
}
