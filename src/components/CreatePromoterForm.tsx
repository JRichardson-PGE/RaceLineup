"use client";

import { useActionState, useRef, useEffect, useState } from "react";
import {
  createPromoterAction,
  type CreatePromoterState,
} from "@/actions/promoters";

const initialState: CreatePromoterState = {};

export function CreatePromoterForm() {
  const [state, formAction, pending] = useActionState(
    createPromoterAction,
    initialState
  );
  const formRef = useRef<HTMLFormElement>(null);
  const [loginType, setLoginType] = useState<"email" | "username">("email");

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
      <div className="flex flex-col gap-1">
        <label htmlFor="name" className="text-sm font-medium text-gray-700">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="rounded-md border border-gray-300 px-3 py-2 text-base text-gray-900"
        />
      </div>

      <fieldset className="flex flex-col gap-1">
        <legend className="text-sm font-medium text-gray-700">
          Login method
        </legend>
        <div className="flex gap-4 text-sm text-gray-700">
          <label className="flex items-center gap-1.5">
            <input
              type="radio"
              name="loginType"
              value="email"
              checked={loginType === "email"}
              onChange={() => setLoginType("email")}
            />
            Email
          </label>
          <label className="flex items-center gap-1.5">
            <input
              type="radio"
              name="loginType"
              value="username"
              checked={loginType === "username"}
              onChange={() => setLoginType("username")}
            />
            Username only (no email)
          </label>
        </div>
      </fieldset>

      {loginType === "email" ? (
        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="rounded-md border border-gray-300 px-3 py-2 text-base text-gray-900"
          />
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          <label
            htmlFor="username"
            className="text-sm font-medium text-gray-700"
          >
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            required
            minLength={3}
            maxLength={32}
            placeholder="e.g. trackside_jamie"
            className="rounded-md border border-gray-300 px-3 py-2 text-base text-gray-900"
          />
          <p className="text-xs text-gray-500">
            No email means no self-service password reset — you&apos;ll need
            to set a new password for them yourself if they forget it.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm font-medium text-gray-700">
          Temporary password
        </label>
        <input
          id="password"
          name="password"
          type="text"
          required
          minLength={8}
          className="rounded-md border border-gray-300 px-3 py-2 text-base text-gray-900"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="role" className="text-sm font-medium text-gray-700">
          Role
        </label>
        <select
          id="role"
          name="role"
          defaultValue="PROMOTER"
          className="rounded-md border border-gray-300 px-3 py-2 text-base text-gray-900"
        >
          <option value="PROMOTER">Promoter</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.success && (
        <p className="text-sm text-green-700">Account created.</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Creating..." : "Create account"}
      </button>
    </form>
  );
}
