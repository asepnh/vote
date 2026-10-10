import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { events } from "@/db/schema";
import { getResults } from "@/app/actions/vote";
import { ResultsClient } from "./results-client";

export const dynamic = "force-dynamic";

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;

  const event = await db.query.events.findFirst({
    where: eq(events.id, eventId),
  });
  if (!event) notFound();

  const results = await getResults(eventId);

  return (
    <main className="mx-auto max-w-xl px-6 py-10">
      <h1 className="text-2xl font-semibold">{event.title} — Live Results</h1>
      <p className="mt-1 mb-8 text-sm text-gray-500">
        Updates automatically every few seconds.
      </p>
      <ResultsClient eventId={eventId} initialResults={results} />
    </main>
  );
}
