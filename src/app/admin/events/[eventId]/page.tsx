import { notFound } from "next/navigation";
import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { candidates, events } from "@/db/schema";
import {
  addCandidate,
  deleteCandidate,
  deleteEvent,
  updateEvent,
} from "@/app/actions/events";

export const dynamic = "force-dynamic";

function toLocalInputValue(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default async function EventDetailPage({
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

  const updateEventWithId = updateEvent.bind(null, eventId);
  const deleteEventWithId = deleteEvent.bind(null, eventId);
  const addCandidateWithId = addCandidate.bind(null, eventId);

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/admin" className="text-sm text-gray-500 underline">
          ← All events
        </Link>
        <Link
          href={`/vote/${eventId}/results`}
          className="text-sm text-blue-600 underline"
          target="_blank"
        >
          View live results
        </Link>
      </div>

      <h1 className="mb-6 text-2xl font-semibold">Edit Event</h1>

      <form action={updateEventWithId} className="mb-10 flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          Title
          <input
            name="title"
            defaultValue={event.title}
            required
            className="rounded-md border border-gray-300 px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Description
          <textarea
            name="description"
            defaultValue={event.description ?? ""}
            rows={3}
            className="rounded-md border border-gray-300 px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Voting starts
          <input
            type="datetime-local"
            name="startsAt"
            defaultValue={toLocalInputValue(event.startsAt)}
            required
            className="rounded-md border border-gray-300 px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Voting ends
          <input
            type="datetime-local"
            name="endsAt"
            defaultValue={toLocalInputValue(event.endsAt)}
            required
            className="rounded-md border border-gray-300 px-3 py-2"
          />
        </label>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="rounded-md bg-gray-900 px-4 py-2 text-white"
          >
            Save changes
          </button>
        </div>
      </form>

      <h2 className="mb-4 text-lg font-semibold">Candidates</h2>

      <ul className="mb-6 flex flex-col gap-3">
        {candidateList.map((candidate) => {
          const deleteCandidateWithId = deleteCandidate.bind(
            null,
            eventId,
            candidate.id,
          );
          return (
            <li
              key={candidate.id}
              className="flex items-start justify-between rounded-md border border-gray-200 px-4 py-3"
            >
              <div>
                <p className="font-medium">{candidate.name}</p>
                {candidate.description && (
                  <p className="text-sm text-gray-500">
                    {candidate.description}
                  </p>
                )}
                {candidate.cvUrl && (
                  <a
                    href={candidate.cvUrl}
                    target="_blank"
                    className="text-sm text-blue-600 underline"
                  >
                    CV link
                  </a>
                )}
              </div>
              <form action={deleteCandidateWithId}>
                <button className="text-sm text-red-600 underline">
                  Remove
                </button>
              </form>
            </li>
          );
        })}
        {candidateList.length === 0 && (
          <p className="text-sm text-gray-500">No candidates yet.</p>
        )}
      </ul>

      <h3 className="mb-3 text-sm font-semibold text-gray-700">
        Add candidate
      </h3>
      <form action={addCandidateWithId} className="mb-10 flex flex-col gap-3">
        <input
          name="name"
          placeholder="Candidate name"
          required
          className="rounded-md border border-gray-300 px-3 py-2"
        />
        <textarea
          name="description"
          placeholder="Background / platform summary"
          rows={2}
          className="rounded-md border border-gray-300 px-3 py-2"
        />
        <input
          name="cvUrl"
          placeholder="Link to CV (Google Drive, PDF URL, etc.)"
          className="rounded-md border border-gray-300 px-3 py-2"
        />
        <button className="self-start rounded-md bg-gray-900 px-4 py-2 text-sm text-white">
          Add candidate
        </button>
      </form>

      <form action={deleteEventWithId}>
        <button className="text-sm text-red-600 underline">
          Delete this event
        </button>
      </form>
    </main>
  );
}
