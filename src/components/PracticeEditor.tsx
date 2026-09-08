"use client";

import { useActionState, useState } from "react";
import {
  savePracticeScheduleAction,
  type PracticeFormState,
} from "@/actions/practice";

type SessionDraft = {
  practiceNumber: number;
  description: string;
  durationType: "laps" | "minutes";
  laps: number;
  minutes: number;
};

export type PracticeSessionDraft = SessionDraft;

function emptySession(practiceNumber: number): SessionDraft {
  return {
    practiceNumber,
    description: "",
    durationType: "minutes",
    laps: 1,
    minutes: 10,
  };
}

function move<T>(list: T[], index: number, direction: -1 | 1): T[] {
  const target = index + direction;
  if (target < 0 || target >= list.length) return list;
  const copy = [...list];
  [copy[index], copy[target]] = [copy[target], copy[index]];
  return copy;
}

const initialState: PracticeFormState = {};

const inputClasses =
  "rounded-md border border-gray-300 px-2 py-1.5 text-sm text-gray-900";
const smallButtonClasses =
  "rounded-md border border-gray-300 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent";

export function PracticeEditor({
  eventId,
  initialSessions,
}: {
  eventId: string;
  initialSessions: SessionDraft[];
}) {
  const [sessions, setSessions] = useState<SessionDraft[]>(
    initialSessions.length > 0 ? initialSessions : [emptySession(1)]
  );
  const [state, formAction, pending] = useActionState(
    savePracticeScheduleAction,
    initialState
  );

  function updateSession(
    index: number,
    updater: (session: SessionDraft) => SessionDraft
  ) {
    setSessions((prev) =>
      prev.map((session, i) => (i === index ? updater(session) : session))
    );
  }

  const payload = {
    sessions: sessions.map((s) => ({
      practiceNumber: s.practiceNumber,
      description: s.description,
      durationType: s.durationType,
      laps: s.durationType === "laps" ? s.laps : undefined,
      minutes: s.durationType === "minutes" ? s.minutes : undefined,
    })),
  };

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="eventId" value={eventId} />
      <input type="hidden" name="schedule" value={JSON.stringify(payload)} />

      <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
        Saving resets the live position back to the start of the practice
        schedule.
      </div>

      <ol className="flex flex-col gap-3">
        {sessions.map((session, index) => (
          <li
            key={index}
            className="rounded-lg border border-gray-200 bg-white p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">
                  Practice #
                </label>
                <input
                  type="number"
                  min={1}
                  className={`${inputClasses} w-20`}
                  value={session.practiceNumber}
                  onChange={(e) =>
                    updateSession(index, (s) => ({
                      ...s,
                      practiceNumber: Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div className="flex gap-1">
                <button
                  type="button"
                  className={smallButtonClasses}
                  disabled={index === 0}
                  onClick={() => setSessions((prev) => move(prev, index, -1))}
                >
                  Move up
                </button>
                <button
                  type="button"
                  className={smallButtonClasses}
                  disabled={index === sessions.length - 1}
                  onClick={() => setSessions((prev) => move(prev, index, 1))}
                >
                  Move down
                </button>
                <button
                  type="button"
                  className={`${smallButtonClasses} border-red-300 text-red-600 hover:bg-red-50`}
                  disabled={sessions.length === 1}
                  onClick={() =>
                    setSessions((prev) => prev.filter((_, i) => i !== index))
                  }
                >
                  Remove
                </button>
              </div>
            </div>

            <div className="mt-2 flex flex-col gap-2">
              <input
                type="text"
                placeholder="Description (e.g. All classes, 65cc and up)"
                className={`${inputClasses} w-full`}
                value={session.description}
                onChange={(e) =>
                  updateSession(index, (s) => ({
                    ...s,
                    description: e.target.value,
                  }))
                }
              />

              <div className="flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-1.5 text-sm text-gray-700">
                  <input
                    type="radio"
                    name={`durationType-${index}`}
                    checked={session.durationType === "minutes"}
                    onChange={() =>
                      updateSession(index, (s) => ({
                        ...s,
                        durationType: "minutes",
                      }))
                    }
                  />
                  Minutes
                </label>
                <label className="flex items-center gap-1.5 text-sm text-gray-700">
                  <input
                    type="radio"
                    name={`durationType-${index}`}
                    checked={session.durationType === "laps"}
                    onChange={() =>
                      updateSession(index, (s) => ({
                        ...s,
                        durationType: "laps",
                      }))
                    }
                  />
                  Laps
                </label>

                {session.durationType === "minutes" ? (
                  <input
                    type="number"
                    min={1}
                    className={`${inputClasses} w-20`}
                    value={session.minutes}
                    onChange={(e) =>
                      updateSession(index, (s) => ({
                        ...s,
                        minutes: Number(e.target.value),
                      }))
                    }
                  />
                ) : (
                  <input
                    type="number"
                    min={1}
                    className={`${inputClasses} w-20`}
                    value={session.laps}
                    onChange={(e) =>
                      updateSession(index, (s) => ({
                        ...s,
                        laps: Number(e.target.value),
                      }))
                    }
                  />
                )}
              </div>
            </div>
          </li>
        ))}
      </ol>

      <button
        type="button"
        className="self-start rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
        onClick={() =>
          setSessions((prev) => [...prev, emptySession(prev.length + 1)])
        }
      >
        + Add practice session
      </button>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Saving..." : "Save practice schedule"}
      </button>
    </form>
  );
}
