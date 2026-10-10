import { createEvent } from "@/app/actions/events";

export default function NewEventPage() {
  return (
    <main className="mx-auto max-w-lg px-6 py-10">
      <h1 className="mb-6 text-2xl font-semibold">New Voting Event</h1>
      <form action={createEvent} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          Title
          <input
            name="title"
            required
            className="rounded-md border border-gray-300 px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Description
          <textarea
            name="description"
            rows={3}
            className="rounded-md border border-gray-300 px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Voting starts
          <input
            type="datetime-local"
            name="startsAt"
            required
            className="rounded-md border border-gray-300 px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Voting ends
          <input
            type="datetime-local"
            name="endsAt"
            required
            className="rounded-md border border-gray-300 px-3 py-2"
          />
        </label>
        <button
          type="submit"
          className="mt-2 rounded-md bg-gray-900 px-4 py-2 text-white"
        >
          Create event
        </button>
      </form>
    </main>
  );
}
