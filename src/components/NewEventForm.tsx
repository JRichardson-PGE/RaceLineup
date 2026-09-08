"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { createEventAction, type EventFormState } from "@/actions/events";
import { slugify } from "@/lib/validation";

const initialState: EventFormState = {};

export function NewEventForm({
  promoters,
}: {
  promoters: { id: string; name: string }[] | null;
}) {
  const [state, formAction, pending] = useActionState(
    createEventAction,
    initialState
  );
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);

  const isAdmin = promoters !== null;
  const noPromoters = isAdmin && promoters.length === 0;

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {isAdmin && (
        <div className="flex flex-col gap-1">
          <label htmlFor="promoterId" className="text-sm font-medium text-gray-700">
            Promoter
          </label>
          {noPromoters ? (
            <p className="text-sm text-gray-500">
              No promoter accounts exist yet — admins don&apos;t own events.
              Create one under{" "}
              <Link href="/dashboard/admin/promoters" className="text-blue-600 hover:underline">
                Promoters
              </Link>{" "}
              first.
            </p>
          ) : (
            <select
              id="promoterId"
              name="promoterId"
              required
              defaultValue=""
              className="rounded-md border border-gray-300 px-3 py-2 text-base text-gray-900"
            >
              <option value="" disabled>
                Select a promoter&hellip;
              </option>
              {promoters.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          )}
        </div>
      )}
      <div className="flex flex-col gap-1">
        <label htmlFor="name" className="text-sm font-medium text-gray-700">
          Event name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          onChange={(e) => {
            if (!slugTouched) setSlug(slugify(e.target.value));
          }}
          className="rounded-md border border-gray-300 px-3 py-2 text-base text-gray-900"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="location" className="text-sm font-medium text-gray-700">
          Location
        </label>
        <input
          id="location"
          name="location"
          type="text"
          required
          className="rounded-md border border-gray-300 px-3 py-2 text-base text-gray-900"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="eventDate" className="text-sm font-medium text-gray-700">
          Date
        </label>
        <input
          id="eventDate"
          name="eventDate"
          type="date"
          required
          className="rounded-md border border-gray-300 px-3 py-2 text-base text-gray-900"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="slug" className="text-sm font-medium text-gray-700">
          Public URL
        </label>
        <div className="flex items-center gap-1">
          <span className="text-sm text-gray-500">/events/</span>
          <input
            id="slug"
            name="slug"
            type="text"
            required
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugTouched(true);
            }}
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-base text-gray-900"
          />
        </div>
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending || noPromoters}
        className="self-start rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Creating..." : "Create event"}
      </button>
    </form>
  );
}
