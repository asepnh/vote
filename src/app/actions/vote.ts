"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { candidates, events, votes } from "@/db/schema";
import { VOTER_AUTH_MODE } from "@/lib/voting-config";

export type CastVoteResult = { ok: true } | { ok: false; error: string };

export async function castVote(
  eventId: string,
  candidateId: string,
  formData: FormData,
): Promise<CastVoteResult> {
  const event = await db.query.events.findFirst({
    where: eq(events.id, eventId),
  });
  if (!event) return { ok: false, error: "Voting event not found." };

  const now = new Date();
  if (now < event.startsAt) return { ok: false, error: "Voting has not started yet." };
  if (now > event.endsAt) return { ok: false, error: "Voting has closed." };

  const candidate = await db.query.candidates.findFirst({
    where: and(eq(candidates.id, candidateId), eq(candidates.eventId, eventId)),
  });
  if (!candidate) return { ok: false, error: "Candidate not found." };

  let voterEmail: string | null = null;
  if (VOTER_AUTH_MODE === "email") {
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    if (!email || !email.includes("@")) {
      return { ok: false, error: "Please enter a valid email address." };
    }
    voterEmail = email;

    const existing = await db.query.votes.findFirst({
      where: and(eq(votes.eventId, eventId), eq(votes.voterEmail, voterEmail)),
    });
    if (existing) {
      return { ok: false, error: "This email has already voted in this event." };
    }
  }

  await db.insert(votes).values({ eventId, candidateId, voterEmail });

  revalidatePath(`/vote/${eventId}/results`);
  return { ok: true };
}

export async function getResults(eventId: string) {
  const candidateList = await db
    .select()
    .from(candidates)
    .where(eq(candidates.eventId, eventId));

  const voteRows = await db
    .select()
    .from(votes)
    .where(eq(votes.eventId, eventId));

  const counts = new Map<string, number>();
  for (const vote of voteRows) {
    counts.set(vote.candidateId, (counts.get(vote.candidateId) ?? 0) + 1);
  }

  return candidateList
    .map((candidate) => ({
      candidate,
      votes: counts.get(candidate.id) ?? 0,
    }))
    .sort((a, b) => b.votes - a.votes);
}
