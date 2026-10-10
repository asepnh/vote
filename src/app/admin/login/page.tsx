"use client";

import { useActionState } from "react";
import { loginAdmin } from "@/app/actions/admin-auth";

export default function AdminLoginPage() {
  const [error, formAction, pending] = useActionState(loginAdmin, undefined);

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-6">
      <div>
        <h1 className="text-2xl font-semibold">Committee Login</h1>
        <p className="mt-1 text-sm text-gray-500">
          Enter the shared committee password to manage voting events.
        </p>
      </div>
      <form action={formAction} className="flex flex-col gap-3">
        <input
          type="password"
          name="password"
          placeholder="Password"
          required
          autoFocus
          className="rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-gray-500"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-gray-900 px-3 py-2 text-white disabled:opacity-50"
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
