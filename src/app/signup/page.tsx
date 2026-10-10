"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerUser } from "@/app/actions/user-auth";

export default function SignupPage() {
  const [error, formAction, pending] = useActionState(registerUser, undefined);

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-6">
      <div>
        <h1 className="text-2xl font-semibold">Create an account</h1>
        <p className="mt-1 text-sm text-gray-500">
          Register to create and manage your own voting events.
        </p>
      </div>
      <form action={formAction} className="flex flex-col gap-3">
        <input
          type="email"
          name="email"
          placeholder="you@example.com"
          required
          autoFocus
          className="rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-gray-500"
        />
        <input
          type="password"
          name="password"
          placeholder="Password (min. 8 characters)"
          required
          minLength={8}
          className="rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-gray-500"
        />
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm password"
          required
          minLength={8}
          className="rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-gray-500"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-gray-900 px-3 py-2 text-white disabled:opacity-50"
        >
          {pending ? "Creating account…" : "Sign up"}
        </button>
      </form>
      <p className="text-sm text-gray-500">
        Already have an account?{" "}
        <Link href="/login" className="underline">
          Log in
        </Link>
      </p>
    </main>
  );
}
