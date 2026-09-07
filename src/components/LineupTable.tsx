export type ClassEntryData = {
  id: string;
  className: string;
  laps: number;
  numRacers: number;
};

export type GateDropData = {
  id: string;
  gateNumber: number;
  classEntries: ClassEntryData[];
};

export type RaceData = {
  id: string;
  raceNumber: number;
  gateDrops: GateDropData[];
};

export type LineupTableProps = {
  races: RaceData[];
  currentRaceId: string | null;
};

export function LineupTable({ races, currentRaceId }: LineupTableProps) {
  if (races.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        No races have been added to this lineup yet.
      </p>
    );
  }

  const currentIndex = races.findIndex((r) => r.id === currentRaceId);
  const nextRaceId = races[currentIndex + 1]?.id ?? null;

  return (
    <ol className="flex flex-col gap-3">
      {races.map((race) => {
        const isCurrent = race.id === currentRaceId;
        const isNext = race.id === nextRaceId;

        return (
          <li
            key={race.id}
            className={`rounded-lg border p-4 ${
              isCurrent
                ? "border-green-600 bg-green-50 ring-2 ring-green-600"
                : isNext
                  ? "border-amber-500 bg-amber-50"
                  : "border-gray-200 bg-white"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-lg font-semibold text-gray-900">
                Race #{race.raceNumber}
              </h3>
              {isCurrent && (
                <span className="rounded-full bg-green-600 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-white">
                  On track
                </span>
              )}
              {isNext && (
                <span className="rounded-full bg-amber-500 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-white">
                  Staging next
                </span>
              )}
            </div>

            <div className="mt-3 flex flex-col gap-3">
              {race.gateDrops.map((gate) => (
                <div key={gate.id} className="rounded-md bg-black/[.03] p-3">
                  <p className="text-sm font-semibold text-gray-700">
                    Gate Drop #{gate.gateNumber}
                  </p>
                  <ul className="mt-1.5 flex flex-col gap-1">
                    {gate.classEntries.map((entry) => (
                      <li
                        key={entry.id}
                        className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 text-sm"
                      >
                        <span className="font-medium text-gray-900">
                          {entry.className}
                        </span>
                        <span className="text-gray-500">
                          {entry.laps} laps &middot; {entry.numRacers} racers
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
