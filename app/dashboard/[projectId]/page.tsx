import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { FeedbackItem } from "./feedback-item";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const session = await auth();
  if (!session?.user?.id) return null;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      feedbacks: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!project || project.userId !== session.user.id) {
    notFound();
  }

  const unreadCount = project.feedbacks.filter((f) => !f.read).length;
  const snippet = `<script src="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/widget.js" data-key="${project.apiKey}"></script>`;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/dashboard"
          className="text-sm text-gray-600 hover:text-black inline-block mb-4"
        >
          ← Back to projects
        </Link>

        <header className="mb-8">
          <h1 className="text-3xl font-bold">{project.name}</h1>
          <p className="text-sm text-gray-600 mt-1">
            {project.feedbacks.length} feedback
            {project.feedbacks.length !== 1 ? "s" : ""} total
            {unreadCount > 0 && (
              <span className="ml-2 text-black font-medium">
                · {unreadCount} unread
              </span>
            )}
          </p>
        </header>

        <section className="mb-8 rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-3">Install the widget</h2>
          <p className="text-sm text-gray-600 mb-3">
            Paste this snippet before the <code className="bg-gray-100 px-1 rounded">&lt;/body&gt;</code> tag of your website:
          </p>
          <pre className="bg-gray-900 text-gray-100 p-4 rounded text-xs overflow-x-auto">
            <code>{snippet}</code>
          </pre>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Feedbacks</h2>
          {project.feedbacks.length === 0 ? (
            <div className="rounded-lg border bg-white p-12 text-center text-gray-500">
              No feedbacks yet. Install the widget above to start collecting them.
            </div>
          ) : (
            project.feedbacks.map((feedback) => (
              <FeedbackItem key={feedback.id} feedback={feedback} />
            ))
          )}
        </section>
      </div>
    </div>
  );
}