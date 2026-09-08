import { practiceScheduleSchema } from "@/lib/validation";
import { readRawRows } from "@/lib/schedule-import";
import type { z } from "zod";

type PracticeScheduleInput = z.infer<typeof practiceScheduleSchema>;

type ColumnKey = "practiceNumber" | "description" | "minutes" | "laps";

const HEADER_ALIASES: Record<ColumnKey, string[]> = {
  practiceNumber: ["practice", "practiceno", "practicenumber"],
  description: ["description", "practicegroup", "group"],
  minutes: ["minutes", "min", "numberofminutes", "numofminutes"],
  laps: ["laps", "numberoflaps", "numoflaps"],
};

const REQUIRED_COLUMNS: ColumnKey[] = ["practiceNumber", "description"];

const COLUMN_LABELS: Record<ColumnKey, string> = {
  practiceNumber: "Practice #",
  description: "Description",
  minutes: "Minutes",
  laps: "Laps",
};

function normalizeHeader(header: string): string {
  return header
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function buildHeaderMap(
  headers: string[]
): Partial<Record<ColumnKey, string>> {
  const map: Partial<Record<ColumnKey, string>> = {};
  for (const header of headers) {
    const normalized = normalizeHeader(header);
    for (const key of Object.keys(HEADER_ALIASES) as ColumnKey[]) {
      if (!map[key] && HEADER_ALIASES[key].includes(normalized)) {
        map[key] = header;
      }
    }
  }
  return map;
}

export type PracticeImportResult =
  | { success: true; schedule: PracticeScheduleInput }
  | { success: false; error: string };

export async function parsePracticeScheduleFile(
  buffer: Buffer,
  filename: string
): Promise<PracticeImportResult> {
  const isCsv = filename.toLowerCase().endsWith(".csv");

  const rawResult = await readRawRows(buffer, isCsv);
  if ("error" in rawResult) {
    return { success: false, error: rawResult.error };
  }
  const rawRows = rawResult.rows;

  if (rawRows.length === 0) {
    return { success: false, error: "No data rows were found in the file." };
  }

  const headerMap = buildHeaderMap(Object.keys(rawRows[0]));
  const missing = REQUIRED_COLUMNS.filter((key) => !headerMap[key]);
  if (missing.length > 0) {
    return {
      success: false,
      error: `Missing required column(s): ${missing
        .map((key) => COLUMN_LABELS[key])
        .join(
          ", "
        )}. Download the template to see the expected column headers.`,
    };
  }

  const sessions: PracticeScheduleInput["sessions"] = [];

  for (let i = 0; i < rawRows.length; i++) {
    const rowNumber = i + 2; // header row is row 1
    const row = rawRows[i];

    const practiceRaw = String(row[headerMap.practiceNumber!] ?? "").trim();
    const descriptionRaw = String(row[headerMap.description!] ?? "").trim();
    const minutesRaw = headerMap.minutes
      ? String(row[headerMap.minutes] ?? "").trim()
      : "";
    const lapsRaw = headerMap.laps
      ? String(row[headerMap.laps] ?? "").trim()
      : "";

    if (!practiceRaw && !descriptionRaw && !minutesRaw && !lapsRaw) {
      continue; // fully blank row
    }

    const practiceNumber = Number(practiceRaw);
    if (!Number.isInteger(practiceNumber) || practiceNumber < 1) {
      return {
        success: false,
        error: `Row ${rowNumber}: "Practice #" must be a positive whole number.`,
      };
    }
    if (!descriptionRaw) {
      return {
        success: false,
        error: `Row ${rowNumber}: "Description" is required.`,
      };
    }

    const hasMinutes = minutesRaw !== "";
    const hasLaps = lapsRaw !== "";
    if (hasMinutes === hasLaps) {
      return {
        success: false,
        error: `Row ${rowNumber}: enter a value in exactly one of "Minutes" or "Laps" (not both, not neither).`,
      };
    }

    if (hasMinutes) {
      const minutes = Number(minutesRaw);
      if (!Number.isInteger(minutes) || minutes < 1) {
        return {
          success: false,
          error: `Row ${rowNumber}: "Minutes" must be a positive whole number.`,
        };
      }
      sessions.push({
        practiceNumber,
        description: descriptionRaw,
        durationType: "minutes",
        minutes,
      });
    } else {
      const laps = Number(lapsRaw);
      if (!Number.isInteger(laps) || laps < 1) {
        return {
          success: false,
          error: `Row ${rowNumber}: "Laps" must be a positive whole number.`,
        };
      }
      sessions.push({
        practiceNumber,
        description: descriptionRaw,
        durationType: "laps",
        laps,
      });
    }
  }

  if (sessions.length === 0) {
    return {
      success: false,
      error: "No usable practice rows were found in the file.",
    };
  }

  sessions.sort((a, b) => a.practiceNumber - b.practiceNumber);

  const validated = practiceScheduleSchema.safeParse({ sessions });
  if (!validated.success) {
    return {
      success: false,
      error:
        validated.error.issues[0]?.message ?? "The file contains invalid data.",
    };
  }

  return { success: true, schedule: validated.data };
}
