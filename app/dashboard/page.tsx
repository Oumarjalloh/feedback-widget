import { auth, signOut } from "@/auth";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button
              type="submit"
              className="rounded-md border border-gray-300 bg-black px-4 py-2 text-sm hover:bg-gray-100"
            >
              Sign out
            </button>
          </form>
        </header>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <p className="text-lg">
            Welcome, <strong>{session?.user?.name || session?.user?.email}</strong>!
          </p>
          <p className="mt-2 text-sm text-gray-600">
            User ID: <code className="rounded bg-gray-100 px-2 py-0.5">{session?.user?.id}</code>
          </p>
        </div>
      </div>
    </div>
  );
}