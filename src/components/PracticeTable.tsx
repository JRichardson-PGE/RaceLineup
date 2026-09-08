export type PracticeSessionData = {
  id: string;
  practiceNumber: number;
  description: string;
  laps: number | null;
  minutes: number | null;
};

export type PracticeTableProps = {
  sessions: PracticeSessionData[];
  currentPracticeId: string | null;
};

function formatDuration(session: PracticeSessionData) {
  if (session.laps !== null) return `${session.laps} laps`;
  if (session.minutes !== null) return `${session.minutes} min`;
  return "";
}

export function PracticeTable({
  sessions,
  currentPracticeId,
}: PracticeTableProps) {
  if (sessions.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        No practice sessions have been added yet.
      </p>
    );
  }

  const currentIndex = sessions.findIndex((s) => s.id === currentPracticeId);
  const nextSessionId = sessions[currentIndex + 1]?.id ?? null;

  return (
    <ol className="flex flex-col gap-3">
      {sessions.map((session) => {
        const isCurrent = session.id === currentPracticeId;
        const isNext = session.id === nextSessionId;

        return (
          <li
            key={session.id}
            data-race-id={session.id}
            className={`scroll-mt-4 rounded-lg border p-4 ${
              isCurrent
                ? "border-green-600 bg-green-50 ring-2 ring-green-600"
                : isNext
                  ? "border-amber-500 bg-amber-50"
                  : "border-gray-200 bg-white"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-lg font-semibold text-gray-900">
                Practice #{session.practiceNumber}{" "}
                <span className="font-normal text-gray-500">
                  &middot; {formatDuration(session)}
                </span>
              </h3>
              {isCurrent && (
                <span className="rounded-full bg-green-600 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-white">
                  On track
                </span>
              )}
              {isNext && (
                <span className="rounded-full bg-amber-500 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-white">
                  On The Line
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-gray-700">{session.description}</p>
          </li>
        );
      })}
    </ol>
  );
}
