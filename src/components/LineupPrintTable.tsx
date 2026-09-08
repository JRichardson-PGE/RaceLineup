import type { RaceData } from "@/components/LineupTable";

export function LineupPrintTable({ races }: { races: RaceData[] }) {
  if (races.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        No races have been added to this lineup yet.
      </p>
    );
  }

  return (
    <table className="w-full table-fixed border-collapse text-base">
      <colgroup>
        <col className="w-[9%]" />
        <col className="w-[9%]" />
        <col className="w-[9%]" />
        <col className="w-[53%]" />
        <col className="w-[20%]" />
      </colgroup>
      <thead>
        <tr className="border-b-2 border-gray-900 text-left text-lg">
          <th className="px-3 py-2">Race</th>
          <th className="px-3 py-2">Laps</th>
          <th className="px-3 py-2">Gate</th>
          <th className="px-3 py-2">Class</th>
          <th className="px-3 py-2 text-right">Riders</th>
        </tr>
      </thead>
      {races.map((race, raceIdx) => {
        const totalRows = race.gateDrops.reduce(
          (sum, gate) => sum + gate.classEntries.length,
          0
        );
        let rowIndexInRace = 0;

        return (
          <tbody
            key={race.id}
            className={`avoid-break ${raceIdx % 2 === 1 ? "bg-gray-50" : ""}`}
          >
            {race.gateDrops.map((gate) =>
              gate.classEntries.map((entry, entryIdx) => {
                const isFirstRowOfRace = rowIndexInRace === 0;
                const isFirstRowOfGate = entryIdx === 0;
                rowIndexInRace++;
                const topBorder = isFirstRowOfRace
                  ? "border-t-2 border-gray-900"
                  : "";

                return (
                  <tr key={entry.id} className="border-b border-gray-200">
                    {isFirstRowOfRace && (
                      <td
                        rowSpan={totalRows}
                        className={`${topBorder} px-3 py-2 align-top text-lg font-bold`}
                      >
                        #{race.raceNumber}
                      </td>
                    )}
                    {isFirstRowOfRace && (
                      <td
                        rowSpan={totalRows}
                        className={`${topBorder} px-3 py-2 align-top`}
                      >
                        {race.laps}
                      </td>
                    )}
                    {isFirstRowOfGate && (
                      <td
                        rowSpan={gate.classEntries.length}
                        className={`${topBorder} px-3 py-2 align-top`}
                      >
                        {gate.gateNumber}
                      </td>
                    )}
                    <td className={`${topBorder} px-3 py-2 break-words`}>
                      {entry.className}
                    </td>
                    <td className={`${topBorder} px-3 py-2 text-right`}>
                      {entry.numRacers}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        );
      })}
    </table>
  );
}
