import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-3xl font-semibold">OSIS Voting</h1>
      <p className="text-gray-600">
        Student representative body voting platform.
      </p>
      <Link
        href="/admin/login"
        className="rounded-md bg-gray-900 px-4 py-2 text-white"
      >
        Committee login
      </Link>
    </main>
  );
}
