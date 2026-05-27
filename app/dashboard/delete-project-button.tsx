"use client";

import { useTransition } from "react";
import { deleteProject } from "./actions";

type Props = {
  projectId: string;
  projectName: string;
};

export function DeleteProjectButton({ projectId, projectName }: Props) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    const ok = confirm(
      `Delete "${projectName}"? All collected feedbacks will be lost. This cannot be undone.`
    );
    if (!ok) return;

    startTransition(async () => {
      await deleteProject(projectId);
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      className="text-sm font-medium text-red-600 hover:underline disabled:opacity-50"
    >
      {pending ? "Deleting..." : "Delete"}
    </button>
  );
}