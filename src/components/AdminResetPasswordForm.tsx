"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  adminSetPasswordAction,
  type AdminSetPasswordState,
} from "@/actions/promoters";

const initialState: AdminSetPasswordState = {};

export function AdminResetPasswordForm({ userId }: { userId: string }) {
  const [state, formAction, pending] = useActionState(
    adminSetPasswordAction,
    initialState
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <details className="w-full">
      <summary className="cursor-pointer text-xs font-medium text-gray-600 hover:text-gray-900">
        Reset password
      </summary>
      <form
        ref={formRef}
        action={formAction}
        className="mt-2 flex flex-wrap items-center gap-2"
      >
        <input type="hidden" name="userId" value={userId} />
        <input
          type="text"
          name="newPassword"
          placeholder="New password"
          required
          minLength={8}
          className="rounded-md border border-gray-300 px-2 py-1 text-sm text-gray-900"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-md border border-gray-300 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-60"
        >
          {pending ? "Saving..." : "Set password"}
        </button>
        {state.error && (
          <span className="text-xs text-red-600">{state.error}</span>
        )}
        {state.success && (
          <span className="text-xs text-green-700">Password updated.</span>
        )}
      </form>
    </details>
  );
}
