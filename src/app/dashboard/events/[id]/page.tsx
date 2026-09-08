import Link from "next/link";
import { requireEventAccess, requireUser } from "@/lib/auth";
import { getEventById } from "@/lib/lineup";
import { togglePublishAction } from "@/actions/events";
import {
  advanceRaceAction,
  moveBackRaceAction,
  restartLineupAction,
} from "@/actions/lineup";
import {
  advancePracticeAction,
  moveBackPracticeAction,
  restartPracticeAction,
  switchToPracticeAction,
  switchToRaceAction,
} from "@/actions/practice";
import { LineupFrame } from "@/components/LineupFrame";
import { PracticeFrame } from "@/components/PracticeFrame";
import { CopyLinkButton } from "@/components/CopyLinkButton";
import { EventQrCode } from "@/components/EventQrCode";
import { ConfirmSubmitButton } from "@/components/ConfirmSubmitButton";

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export default async function EventControlPage({
  params,
}: PageProps<"/dashboard/events/[id]">) {
  const { id } = await params;
  const user = await requireUser();
  await requireEventAccess(id, user);
  const event = await getEventById(id);

  if (!event) return null;

  const isRaceActive = event.activeSchedule === "RACE";
  const isPracticeActive = event.activeSchedule === "PRACTICE";
  const hasPractice = event.practiceSessions.length > 0;

  const currentRaceIndex = event.races.findIndex(
    (r) => r.id === event.currentRaceId
  );
  const canAdvanceRace =
    isRaceActive &&
    event.races.length > 0 &&
    currentRaceIndex + 1 < event.races.length;

  const currentPracticeIndex = event.practiceSessions.findIndex(
    (p) => p.id === event.currentPracticeId
  );
  const canAdvancePractice =
    isPracticeActive &&
    hasPractice &&
    currentPracticeIndex + 1 < event.practiceSessions.length;

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{event.name}</h1>
          <p className="text-sm text-gray-500">
            {event.location} &middot; {formatDate(event.eventDate)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ${
              event.published
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {event.published ? "Published" : "Draft"}
          </span>
          <Link
            href={`/dashboard/events/${event.id}/edit`}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Edit details
          </Link>
          <Link
            href={`/dashboard/events/${event.id}/practice`}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Edit practice
          </Link>
          <Link
            href={`/dashboard/events/${event.id}/lineup`}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Edit lineup
          </Link>
          <form action={togglePublishAction}>
            <input type="hidden" name="eventId" value={event.id} />
            <button
              type="submit"
              className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-semibold text-white"
            >
              {event.published ? "Unpublish" : "Publish"}
            </button>
          </form>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={`/events/${event.slug}`}
          target="_blank"
          className="text-sm text-blue-600 hover:underline"
        >
          View public page &rarr;
        </Link>
        <CopyLinkButton path={`/events/${event.slug}`} />
        <EventQrCode path={`/events/${event.slug}`} />
        <Link
          href={`/dashboard/events/${event.id}/print`}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
        >
          Print PDF
        </Link>
      </div>
      {!event.published && (
        <p className="text-sm text-gray-500">
          This event isn&apos;t published yet — the public page will show
          &ldquo;the race lineup is not yet posted&rdquo; until you publish
          it. The link above is safe to share early.
        </p>
      )}

      {hasPractice && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white p-3">
          <p className="text-sm text-gray-700">
            Public page is currently showing:{" "}
            <span className="font-semibold">
              {isPracticeActive ? "Practice schedule" : "Race lineup"}
            </span>
          </p>
          {isPracticeActive ? (
            <form action={switchToRaceAction}>
              <input type="hidden" name="eventId" value={event.id} />
              <button
                type="submit"
                className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-semibold text-white hover:bg-gray-700"
              >
                Switch to race lineup &rarr;
              </button>
            </form>
          ) : (
            <form action={switchToPracticeAction}>
              <input type="hidden" name="eventId" value={event.id} />
              <button
                type="submit"
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                &larr; Back to practice
              </button>
            </form>
          )}
        </div>
      )}

      {hasPractice ? (
        <details open={isPracticeActive}>
          <summary className="cursor-pointer text-lg font-bold text-gray-900">
            Practice
            {!isPracticeActive && (
              <span className="ml-2 text-sm font-normal text-gray-400">
                (not showing publicly)
              </span>
            )}
          </summary>
          <div className="mt-2 flex flex-col gap-4">
            <div className="flex flex-wrap gap-2 rounded-lg border border-gray-200 bg-white p-4">
              <form action={moveBackPracticeAction}>
                <input type="hidden" name="eventId" value={event.id} />
                <button
                  type="submit"
                  disabled={!isPracticeActive}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
                >
                  &larr; Move back
                </button>
              </form>
              <form action={advancePracticeAction}>
                <input type="hidden" name="eventId" value={event.id} />
                <button
                  type="submit"
                  disabled={!canAdvancePractice}
                  className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 disabled:hover:bg-gray-300"
                >
                  Advance &rarr;
                </button>
              </form>
              <form action={restartPracticeAction}>
                <input type="hidden" name="eventId" value={event.id} />
                <ConfirmSubmitButton
                  confirmMessage="Restart the practice schedule? This clears the current session and starts back at the beginning."
                  disabled={!isPracticeActive}
                  className="rounded-md border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
                >
                  Restart practice
                </ConfirmSubmitButton>
              </form>
            </div>
            <PracticeFrame
              sessions={event.practiceSessions}
              currentPracticeId={event.currentPracticeId}
            />
          </div>
        </details>
      ) : (
        <>
          <h2 className="text-lg font-bold text-gray-900">Practice</h2>
          <p className="text-sm text-gray-500">
            No practice schedule yet.{" "}
            <Link
              href={`/dashboard/events/${event.id}/practice`}
              className="text-blue-600 hover:underline"
            >
              Add one
            </Link>{" "}
            to run practice before the race.
          </p>
        </>
      )}

      <details open={isRaceActive}>
        <summary className="cursor-pointer text-lg font-bold text-gray-900">
          Race
          {!isRaceActive && (
            <span className="ml-2 text-sm font-normal text-gray-400">
              (not showing publicly)
            </span>
          )}
        </summary>
        <div className="mt-2 flex flex-col gap-4">
          <div className="flex flex-wrap gap-2 rounded-lg border border-gray-200 bg-white p-4">
            <form action={moveBackRaceAction}>
              <input type="hidden" name="eventId" value={event.id} />
              <button
                type="submit"
                disabled={!isRaceActive}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
              >
                &larr; Move back
              </button>
            </form>
            <form action={advanceRaceAction}>
              <input type="hidden" name="eventId" value={event.id} />
              <button
                type="submit"
                disabled={!canAdvanceRace}
                className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 disabled:hover:bg-gray-300"
              >
                Advance &rarr;
              </button>
            </form>
            <form action={restartLineupAction}>
              <input type="hidden" name="eventId" value={event.id} />
              <ConfirmSubmitButton
                confirmMessage="Restart the lineup? This clears the current race and starts back at the beginning."
                disabled={!isRaceActive}
                className="rounded-md border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
              >
                Restart lineup
              </ConfirmSubmitButton>
            </form>
          </div>
          <LineupFrame races={event.races} currentRaceId={event.currentRaceId} />
        </div>
      </details>
    </>
  );
}
