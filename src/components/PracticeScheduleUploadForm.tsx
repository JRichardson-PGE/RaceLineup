"use client";

import { useActionState } from "react";
import {
  uploadPracticeScheduleAction,
  type UploadPracticeScheduleState,
} from "@/actions/practice";

const initialState: UploadPracticeScheduleState = {};

export function PracticeScheduleUploadForm({ eventId }: { eventId: string }) {
  const [state, formAction, pending] = useActionState(
    uploadPracticeScheduleAction,
    initialState
  );

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <h2 className="text-sm font-semibold text-gray-900">
        Upload a practice schedule
      </h2>
      <p className="mt-1 text-sm text-gray-500">
        Fill out the template below and upload it to set the whole practice
        schedule at once. This replaces the current practice schedule.
      </p>
      <div className="mt-2 flex flex-wrap gap-4 text-sm">
        <a
          href="/templates/practice-schedule-template.xlsx"
          className="font-medium text-blue-600 hover:underline"
        >
          Download Excel template
        </a>
        <a
          href="/templates/practice-schedule-template.csv"
          className="font-medium text-blue-600 hover:underline"
        >
          Download CSV template
        </a>
      </div>
      <form
        action={formAction}
        className="mt-3 flex flex-wrap items-center gap-3"
      >
        <input type="hidden" name="eventId" value={eventId} />
        <input
          type="file"
          name="file"
          accept=".xlsx,.csv"
          required
          className="text-sm text-gray-700 file:mr-3 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-200"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {pending ? "Uploading..." : "Upload"}
        </button>
      </form>
      {state.error && (
        <p className="mt-2 text-sm text-red-600">{state.error}</p>
      )}
    </div>
  );
}
