import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { candidates, events } from "@/db/schema";
import { VoteForm } from "./vote-form";

export const dynamic = "force-dynamic";

export default async function VotePage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;

  const event = await db.query.events.findFirst({
    where: eq(events.id, eventId),
  });
  if (!event) notFound();

  const candidateList = await db
    .select()
    .from(candidates)
    .where(eq(candidates.eventId, eventId))
    .orderBy(asc(candidates.createdAt));

  const now = new Date();
  const notStarted = now < event.startsAt;
  const closed = now > event.endsAt;

  return (
    <main className="mx-auto max-w-xl px-6 py-10">
      <h1 className="text-2xl font-semibold">{event.title}</h1>
      {event.description && (
        <p className="mt-2 text-gray-600">{event.description}</p>
      )}
      <p className="mt-1 text-sm text-gray-500">
        Voting window: {event.startsAt.toLocaleString()} →{" "}
        {event.endsAt.toLocaleString()}
      </p>

      <div className="mt-8">
        {notStarted && (
          <p className="rounded-md border border-yellow-200 bg-yellow-50 p-4 text-yellow-800">
            Voting has not started yet. Please check back later.
          </p>
        )}
        {closed && (
          <div className="rounded-md border border-gray-200 bg-gray-50 p-4 text-gray-700">
            <p>Voting has closed.</p>
            <a
              href={`/vote/${eventId}/results`}
              className="mt-2 inline-block text-sm text-blue-600 underline"
            >
              View final results
            </a>
          </div>
        )}
        {!notStarted && !closed && candidateList.length === 0 && (
          <p className="text-gray-500">No candidates have been added yet.</p>
        )}
        {!notStarted && !closed && candidateList.length > 0 && (
          <VoteForm eventId={eventId} candidates={candidateList} />
        )}
      </div>
    </main>
  );
}
