"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createProject } from "./actions";

const initialState = { error: null };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-black px-4 py-2 text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? "Creating..." : "Create project"}
    </button>
  );
}

export function CreateProjectForm() {
  const [state, formAction] = useActionState(createProject, initialState);

  return (
    <form action={formAction} className="space-y-3">
      <div className="flex gap-3">
        <input
          type="text"
          name="name"
          placeholder="My awesome project"
          required
          minLength={2}
          maxLength={50}
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:outline-none"
        />
        <SubmitButton />
      </div>
      {state?.error && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}
    </form>
  );
}