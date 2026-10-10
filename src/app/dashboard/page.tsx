import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { events } from "@/db/schema";
import { getUserEmail } from "@/lib/user-session";
import { logoutUser } from "@/app/actions/user-auth";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const email = await getUserEmail();

  const myEvents = email
    ? await db
        .select()
        .from(events)
        .where(eq(events.ownerEmail, email))
        .orderBy(desc(events.createdAt))
    : [];

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">My Events</h1>
          <p className="text-sm text-gray-500">Logged in as {email}</p>
        </div>
        <form action={logoutUser}>
          <button className="text-sm text-gray-500 underline">Log out</button>
        </form>
      </div>

      <Link
        href="/events/new"
        className="mb-6 inline-block rounded-md bg-gray-900 px-4 py-2 text-sm text-white"
      >
        + New Event
      </Link>

      <ul className="flex flex-col gap-3">
        {myEvents.map((event) => (
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
                {event.startsAt.toLocaleString()} → {event.endsAt.toLocaleString()}
              </p>
            </div>
            <Link
              href={`/vote/${event.id}`}
              className="text-sm text-blue-600 underline"
              target="_blank"
            >
              Voting link
            </Link>
          </li>
        ))}
        {myEvents.length === 0 && (
          <p className="text-sm text-gray-500">
            You haven&apos;t created any events yet.
          </p>
        )}
      </ul>
    </main>
  );
}
