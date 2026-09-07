import { notFound } from "next/navigation";
import { requireEventAccess, requireUser } from "@/lib/auth";
import { getEventById } from "@/lib/lineup";
import { PrintButton } from "@/components/PrintButton";

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export default async function PrintLineupPage({
  params,
}: PageProps<"/dashboard/events/[id]/print">) {
  const { id } = await params;
  const user = await requireUser();
  await requireEventAccess(id, user);
  const event = await getEventById(id);

  if (!event) notFound();

  return (
    <div className="mx-auto max-w-3xl p-4 print:max-w-none print:p-0">
      <div className="no-print mb-4">
        <PrintButton />
      </div>

      <h1 className="mb-1 text-xl font-bold text-gray-900">{event.name}</h1>
      <p className="mb-4 text-sm text-gray-600">
        {event.location} &middot; {formatDate(event.eventDate)}
      </p>

      {event.races.length === 0 && (
        <p className="text-sm text-gray-500">
          No races have been added to this lineup yet.
        </p>
      )}

      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="border-b-2 border-gray-900 text-left">
            <th className="px-2 py-1">Race</th>
            <th className="px-2 py-1">Laps</th>
            <th className="px-2 py-1">Gate</th>
            <th className="px-2 py-1">Class</th>
            <th className="px-2 py-1 text-right">Riders</th>
          </tr>
        </thead>
        {event.races.map((race, raceIdx) => {
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
                          className={`${topBorder} px-2 py-1 align-top font-semibold`}
                        >
                          #{race.raceNumber}
                        </td>
                      )}
                      {isFirstRowOfRace && (
                        <td
                          rowSpan={totalRows}
                          className={`${topBorder} px-2 py-1 align-top`}
                        >
                          {race.laps}
                        </td>
                      )}
                      {isFirstRowOfGate && (
                        <td
                          rowSpan={gate.classEntries.length}
                          className={`${topBorder} px-2 py-1 align-top`}
                        >
                          {gate.gateNumber}
                        </td>
                      )}
                      <td className={`${topBorder} px-2 py-1`}>
                        {entry.className}
                      </td>
                      <td className={`${topBorder} px-2 py-1 text-right`}>
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
    </div>
  );
}
