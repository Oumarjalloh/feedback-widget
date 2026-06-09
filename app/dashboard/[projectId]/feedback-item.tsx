"use client";

import { useTransition } from "react";
import { toggleReadFeedback, deleteFeedback } from "./actions";

type Feedback = {
  id: string;
  message: string;
  email: string | null;
  pageUrl: string | null;
  read: boolean;
  createdAt: Date;
};

export function FeedbackItem({ feedback }: { feedback: Feedback }) {
  const [pending, startTransition] = useTransition();

  const dateStr = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(feedback.createdAt);

  return (
    <article
      className={`rounded-lg border bg-white p-6 shadow-sm ${
        !feedback.read ? "border-l-4 border-l-black" : ""
      }`}
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 space-y-3">
          <p className="text-gray-900 whitespace-pre-wrap">{feedback.message}</p>
          <div className="text-xs text-gray-500 space-y-1">
            {feedback.email && (
              <p>From: <span className="font-mono">{feedback.email}</span></p>
            )}
            {feedback.pageUrl && (
              <p>
                Page:{" "}
                
                  href={feedback.pageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono hover:underline break-all"
                <a>
                  {feedback.pageUrl}
                </a>
              </p>
            )}
            <p>{dateStr}</p>
          </div>
        </div>
        <div className="flex flex-col gap-2 flex-shrink-0">
          <button
            onClick={() => startTransition(() => toggleReadFeedback(feedback.id))}
            disabled={pending}
            className="text-xs px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
          >
            {feedback.read ? "Mark unread" : "Mark read"}
          </button>
          <button
            onClick={() => {
              if (!confirm("Delete this feedback?")) return;
              startTransition(() => deleteFeedback(feedback.id));
            }}
            disabled={pending}
            className="text-xs px-3 py-1 text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
          >
            Delete
          </button>
        </div>
       </div>
    </article>
  );
}