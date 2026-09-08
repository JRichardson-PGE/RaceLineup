import {
  formatDuration,
  type PracticeSessionData,
} from "@/components/PracticeTable";

export function PracticePrintTable({
  sessions,
}: {
  sessions: PracticeSessionData[];
}) {
  if (sessions.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        No practice sessions have been added yet.
      </p>
    );
  }

  return (
    <table className="w-full table-fixed border-collapse text-base">
      <colgroup>
        <col className="w-[15%]" />
        <col className="w-[65%]" />
        <col className="w-[20%]" />
      </colgroup>
      <thead>
        <tr className="border-b-2 border-gray-900 text-left text-lg">
          <th className="px-3 py-2">Practice</th>
          <th className="px-3 py-2">Description</th>
          <th className="px-3 py-2 text-right">Duration</th>
        </tr>
      </thead>
      <tbody>
        {sessions.map((session, idx) => (
          <tr
            key={session.id}
            className={`avoid-break border-b border-gray-200 ${
              idx % 2 === 1 ? "bg-gray-50" : ""
            }`}
          >
            <td className="px-3 py-2 align-top text-lg font-bold">
              #{session.practiceNumber}
            </td>
            <td className="px-3 py-2 align-top break-words">
              {session.description}
            </td>
            <td className="px-3 py-2 text-right align-top">
              {formatDuration(session)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
