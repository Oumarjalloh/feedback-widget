import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CreateProjectForm } from "./create-project-form";
import { DeleteProjectButton } from "./delete-project-button";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const projects = await prisma.project.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { feedbacks: true } },
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Your projects</h1>
            <p className="text-sm text-gray-600 mt-1">
              Logged in as <strong>{session.user.email}</strong>
            </p>
          </div>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button
              type="submit"
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-100"
            >
              Sign out
            </button>
          </form>
        </header>

        <section className="mb-8 rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Create a new project</h2>
          <CreateProjectForm />
        </section>

        <section className="space-y-3">
          {projects.length === 0 ? (
            <div className="rounded-lg border bg-white p-12 text-center text-gray-500">
              No projects yet. Create your first one above to get started.
            </div>
          ) : (
            projects.map((project) => (
              <article
                key={project.id}
                className="rounded-lg border bg-white p-6 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">{project.name}</h3>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">API Key</p>
                      <code className="inline-block bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                        {project.apiKey}
                      </code>
                    </div>
                    <p className="text-xs text-gray-500">
                      {project._count.feedbacks} feedback
                      {project._count.feedbacks !== 1 ? "s" : ""} · created{" "}
                      {new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(project.createdAt)}
                    </p>
                  </div>
                  <DeleteProjectButton
                    projectId={project.id}
                    projectName={project.name}
                  />
                </div>
              </article>
            ))
          )}
        </section>
      </div>
    </div>
  );
}