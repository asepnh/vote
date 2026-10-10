"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { candidates, events } from "@/db/schema";
import { getUserEmail } from "@/lib/user-session";
import { requireEventAccess } from "@/lib/event-access";

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
  const ownerEmail = await getUserEmail();
  if (!ownerEmail) {
    redirect("/login");
  }

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const startsAt = parseDateTime(formData.get("startsAt"));
  const endsAt = parseDateTime(formData.get("endsAt"));

  if (!title) throw new Error("Title is required");
  if (endsAt <= startsAt) throw new Error("End time must be after start time");

  const [created] = await db
    .insert(events)
    .values({ title, description: description || null, ownerEmail, startsAt, endsAt })
    .returning({ id: events.id });

  revalidatePath("/dashboard");
  redirect(`/events/${created.id}/manage`);
}

export async function updateEvent(eventId: string, formData: FormData) {
  await requireEventAccess(eventId);

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

  revalidatePath(`/events/${eventId}/manage`);
  revalidatePath("/dashboard");
  revalidatePath("/admin");
}

export async function deleteEvent(eventId: string) {
  const { isSuperAdmin } = await requireEventAccess(eventId);

  await db.delete(events).where(eq(events.id, eventId));
  revalidatePath("/dashboard");
  revalidatePath("/admin");
  redirect(isSuperAdmin ? "/admin" : "/dashboard");
}

export async function addCandidate(eventId: string, formData: FormData) {
  await requireEventAccess(eventId);

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

  revalidatePath(`/events/${eventId}/manage`);
}

export async function deleteCandidate(eventId: string, candidateId: string) {
  await requireEventAccess(eventId);

  await db.delete(candidates).where(eq(candidates.id, candidateId));
  revalidatePath(`/events/${eventId}/manage`);
}
