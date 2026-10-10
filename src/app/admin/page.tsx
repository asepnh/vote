import Link from "next/link";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { events } from "@/db/schema";
import { logoutAdmin } from "@/app/actions/admin-auth";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const allEvents = await db
    .select()
    .from(events)
    .orderBy(desc(events.createdAt));

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">All Voting Events</h1>
          <p className="text-sm text-gray-500">
            Committee oversight — every event created by any user.
          </p>
        </div>
        <form action={logoutAdmin}>
          <button className="text-sm text-gray-500 underline">Log out</button>
        </form>
      </div>

      <ul className="flex flex-col gap-3">
        {allEvents.map((event) => (
          <li
            key={event.id}
            className="flex items-center justify-between rounded-md border border-gray-200 px-4 py-3"
          >
            <div>
              <Link
                href={`/events/${event.id}/manage`}
                className="font-medium hover:underline"
              >
                {event.title}
              </Link>
              <p className="text-sm text-gray-500">
                Owner: {event.ownerEmail ?? "—"}
              </p>
              <p className="text-sm text-gray-500">
                {event.startsAt.toLocaleString()} → {event.endsAt.toLocaleString()}
              </p>
            </div>
            <Link
              href={`/vote/${event.id}`}
              className="text-sm text-blue-600 underline"
              target="_blank"
            >
              View voting page
            </Link>
          </li>
        ))}
        {allEvents.length === 0 && (
          <p className="text-sm text-gray-500">No events yet.</p>
        )}
      </ul>
    </main>
  );
}
