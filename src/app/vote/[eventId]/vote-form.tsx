"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { castVote } from "@/app/actions/vote";
import { VOTER_AUTH_MODE } from "@/lib/voting-config";

type Candidate = {
  id: string;
  name: string;
  description: string | null;
  cvUrl: string | null;
};

export function VoteForm({
  eventId,
  candidates,
}: {
  eventId: string;
  candidates: Candidate[];
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit() {
    if (!selected) {
      setError("Please select a candidate first.");
      return;
    }
    setError(null);
    const formData = new FormData();
    if (VOTER_AUTH_MODE === "email") formData.set("email", email);

    startTransition(async () => {
      const result = await castVote(eventId, selected, formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setDone(true);
      router.refresh();
    });
  }

  if (done) {
    return (
      <div className="rounded-md border border-green-200 bg-green-50 p-6 text-green-800">
        <p className="font-medium">Your vote has been recorded. Thank you!</p>
        <a
          href={`/vote/${eventId}/results`}
          className="mt-2 inline-block text-sm underline"
        >
          View live results
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-col gap-3">
        {candidates.map((candidate) => (
          <li key={candidate.id}>
            <label
              className={`block cursor-pointer rounded-md border px-4 py-3 ${
                selected === candidate.id
                  ? "border-gray-900 ring-1 ring-gray-900"
                  : "border-gray-200"
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  name="candidate"
                  value={candidate.id}
                  checked={selected === candidate.id}
                  onChange={() => setSelected(candidate.id)}
                  className="mt-1"
                />
                <div>
                  <p className="font-medium">{candidate.name}</p>
                  {candidate.description && (
                    <p className="text-sm text-gray-600">
                      {candidate.description}
                    </p>
                  )}
                  {candidate.cvUrl && (
                    <a
                      href={candidate.cvUrl}
                      target="_blank"
                      onClick={(e) => e.stopPropagation()}
                      className="text-sm text-blue-600 underline"
                    >
                      View CV
                    </a>
                  )}
                </div>
              </div>
            </label>
          </li>
        ))}
      </ul>

      {VOTER_AUTH_MODE === "email" && (
        <label className="flex flex-col gap-1 text-sm">
          Your email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            className="rounded-md border border-gray-300 px-3 py-2"
          />
        </label>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={pending}
        className="self-start rounded-md bg-gray-900 px-4 py-2 text-white disabled:opacity-50"
      >
        {pending ? "Submitting…" : "Cast my vote"}
      </button>
    </div>
  );
}
