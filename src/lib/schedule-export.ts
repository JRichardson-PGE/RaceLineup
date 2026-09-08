import ExcelJS from "exceljs";
import Papa from "papaparse";

export type ExportFormat = "xlsx" | "csv";

type ExportableRace = {
  raceNumber: number;
  laps: number;
  gateDrops: {
    gateNumber: number;
    classEntries: { className: string; numRacers: number }[];
  }[];
};

type ExportablePracticeSession = {
  practiceNumber: number;
  description: string;
  laps: number | null;
  minutes: number | null;
};

const RACE_COLUMNS = [
  { header: "Race #", key: "race", width: 10 },
  { header: "Laps", key: "laps", width: 10 },
  { header: "Gate Drop #", key: "gate", width: 14 },
  { header: "Class Name", key: "className", width: 32 },
  { header: "# of Racers", key: "racers", width: 14 },
] as const;

const PRACTICE_COLUMNS = [
  { header: "Practice #", key: "practice", width: 12 },
  { header: "Description", key: "description", width: 32 },
  { header: "Minutes", key: "minutes", width: 12 },
  { header: "Laps", key: "laps", width: 10 },
] as const;

async function buildWorkbook(
  sheetName: string,
  columns: readonly { header: string; key: string; width: number }[],
  rows: Record<string, string | number>[]
): Promise<Uint8Array> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(sheetName);
  sheet.columns = columns.map((c) => ({ ...c }));
  sheet.getRow(1).font = { bold: true };
  rows.forEach((row) => sheet.addRow(row));
  return new Uint8Array(await workbook.xlsx.writeBuffer());
}

function buildCsv(
  columns: readonly { header: string; key: string }[],
  rows: Record<string, string | number>[]
): string {
  return Papa.unparse({
    fields: columns.map((c) => c.header),
    data: rows.map((row) => columns.map((c) => row[c.key])),
  });
}

function raceRows(races: ExportableRace[]): Record<string, string | number>[] {
  const rows: Record<string, string | number>[] = [];
  for (const race of races) {
    for (const gate of race.gateDrops) {
      for (const entry of gate.classEntries) {
        rows.push({
          race: race.raceNumber,
          laps: race.laps,
          gate: gate.gateNumber,
          className: entry.className,
          racers: entry.numRacers,
        });
      }
    }
  }
  return rows;
}

function practiceRows(
  sessions: ExportablePracticeSession[]
): Record<string, string | number>[] {
  return sessions.map((session) => ({
    practice: session.practiceNumber,
    description: session.description,
    minutes: session.minutes ?? "",
    laps: session.laps ?? "",
  }));
}

export async function exportRaceLineup(
  races: ExportableRace[],
  format: ExportFormat
): Promise<{ body: Uint8Array | string; contentType: string }> {
  const rows = raceRows(races);
  if (format === "csv") {
    return {
      body: buildCsv(RACE_COLUMNS, rows),
      contentType: "text/csv; charset=utf-8",
    };
  }
  return {
    body: await buildWorkbook("Schedule", RACE_COLUMNS, rows),
    contentType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  };
}

export async function exportPracticeSchedule(
  sessions: ExportablePracticeSession[],
  format: ExportFormat
): Promise<{ body: Uint8Array | string; contentType: string }> {
  const rows = practiceRows(sessions);
  if (format === "csv") {
    return {
      body: buildCsv(PRACTICE_COLUMNS, rows),
      contentType: "text/csv; charset=utf-8",
    };
  }
  return {
    body: await buildWorkbook("Practice", PRACTICE_COLUMNS, rows),
    contentType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  };
}
