import { auth } from "@/auth";
import Link from "next/link";

export default async function Home() {
  const session = await auth();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-8">
      <div className="max-w-2xl text-center">
        <h1 className="mb-4 text-5xl font-bold">Feedback Widget</h1>
        <p className="mb-8 text-lg text-gray-600">
          Collect honest feedback from your website visitors in seconds.
        </p>
        <Link
          href={session?.user ? "/dashboard" : "/login"}
          className="inline-block rounded-md bg-black px-8 py-3 text-white transition hover:bg-gray-800"
        >
          {session?.user ? "Go to Dashboard" : "Get started"}
        </Link>
      </div>
    </main>
  );
}