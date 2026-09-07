"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  changePasswordAction,
  type ChangePasswordState,
} from "@/actions/profile";

const initialState: ChangePasswordState = {};

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(
    changePasswordAction,
    initialState
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-4"
    >
      <h2 className="text-sm font-semibold text-gray-900">Change password</h2>
      <div className="flex flex-col gap-1">
        <label
          htmlFor="currentPassword"
          className="text-sm font-medium text-gray-700"
        >
          Current password
        </label>
        <input
          id="currentPassword"
          name="currentPassword"
          type="password"
          required
          autoComplete="current-password"
          className="rounded-md border border-gray-300 px-3 py-2 text-base text-gray-900"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label
          htmlFor="newPassword"
          className="text-sm font-medium text-gray-700"
        >
          New password
        </label>
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="rounded-md border border-gray-300 px-3 py-2 text-base text-gray-900"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label
          htmlFor="confirmPassword"
          className="text-sm font-medium text-gray-700"
        >
          Confirm new password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="rounded-md border border-gray-300 px-3 py-2 text-base text-gray-900"
        />
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.success && (
        <p className="text-sm text-green-700">Password updated.</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Saving..." : "Update password"}
      </button>
    </form>
  );
}
