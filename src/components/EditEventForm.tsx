"use client";

import { useActionState } from "react";
import { updateEventAction, type EventFormState } from "@/actions/events";

const initialState: EventFormState = {};

function toDateInputValue(date: Date | string) {
  const d = new Date(date);
  const pad = (n: number) => String(n).padStart(2, "0");
  // Use UTC getters: eventDate is stored as a date-only value (UTC midnight),
  // so local getters could shift it a day in timezones behind UTC.
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

export function EditEventForm({
  event,
}: {
  event: {
    id: string;
    name: string;
    location: string;
    eventDate: Date | string;
    slug: string;
  };
}) {
  const [state, formAction, pending] = useActionState(
    updateEventAction,
    initialState
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="eventId" value={event.id} />
      <div className="flex flex-col gap-1">
        <label htmlFor="name" className="text-sm font-medium text-gray-700">
          Event name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={event.name}
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
          defaultValue={event.location}
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
          defaultValue={toDateInputValue(event.eventDate)}
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
            defaultValue={event.slug}
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
        {pending ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}
