"use client";

import { useActionState, useState } from "react";
import { createEventAction, type EventFormState } from "@/actions/events";
import { slugify } from "@/lib/validation";

const initialState: EventFormState = {};

export default function NewEventPage() {
  const [state, formAction, pending] = useActionState(
    createEventAction,
    initialState
  );
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900">New event</h1>
      <form action={formAction} className="flex flex-col gap-4">
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
          disabled={pending}
          className="self-start rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {pending ? "Creating..." : "Create event"}
        </button>
      </form>
    </>
  );
}
