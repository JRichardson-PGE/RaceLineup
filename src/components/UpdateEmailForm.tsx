"use client";

import { useActionState } from "react";
import { updateEmailAction, type UpdateEmailState } from "@/actions/profile";

const initialState: UpdateEmailState = {};

export function UpdateEmailForm({
  currentEmail,
}: {
  currentEmail: string | null;
}) {
  const [state, formAction, pending] = useActionState(
    updateEmailAction,
    initialState
  );

  return (
    <form
      action={formAction}
      className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-4"
    >
      <div>
        <h2 className="text-sm font-semibold text-gray-900">
          Recovery email
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          {currentEmail
            ? "Update the email attached to your account."
            : "Your account currently has no email attached. Add one so you have a way to recover access."}
        </p>
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          defaultValue={currentEmail ?? ""}
          className="rounded-md border border-gray-300 px-3 py-2 text-base text-gray-900"
        />
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.success && (
        <p className="text-sm text-green-700">Email updated.</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Saving..." : currentEmail ? "Update email" : "Add email"}
      </button>
    </form>
  );
}
