import ExcelJS from "exceljs";
import Papa from "papaparse";
import { lineupSchema } from "@/lib/validation";
import type { z } from "zod";

type LineupInput = z.infer<typeof lineupSchema>;

type ColumnKey = "race" | "laps" | "gate" | "className" | "racers";

const HEADER_ALIASES: Record<ColumnKey, string[]> = {
  race: ["race", "raceno", "racenumber"],
  laps: ["laps", "numberoflaps", "numoflaps", "lapsperrace"],
  gate: [
    "gatedrop",
    "gatedropno",
    "gatedropnumber",
    "gate",
    "gateno",
    "gatenumber",
  ],
  className: ["classname", "class"],
  racers: [
    "racers",
    "numberofracers",
    "numofracers",
    "ofracers",
    "numracers",
  ],
};

const COLUMN_LABELS: Record<ColumnKey, string> = {
  race: "Race #",
  laps: "Laps",
  gate: "Gate Drop #",
  className: "Class Name",
  racers: "# of Racers",
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

export type ScheduleImportResult =
  | { success: true; lineup: LineupInput }
  | { success: false; error: string };

async function readRawRows(
  buffer: Buffer,
  isCsv: boolean
): Promise<{ rows: Record<string, unknown>[] } | { error: string }> {
  if (isCsv) {
    const text = buffer.toString("utf-8");
    const parsed = Papa.parse<Record<string, string>>(text, {
      header: true,
      skipEmptyLines: true,
    });
    if (parsed.errors.length > 0) {
      return {
        error: `Could not read the CSV file: ${parsed.errors[0].message}`,
      };
    }
    return { rows: parsed.data };
  }

  const workbook = new ExcelJS.Workbook();
  try {
    await workbook.xlsx.load(buffer as unknown as ArrayBuffer);
  } catch {
    return {
      error:
        "Could not read the Excel file. Make sure it's a valid .xlsx file.",
    };
  }

  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    return { error: "The Excel file doesn't have any sheets." };
  }

  const headers: string[] = [];
  worksheet.getRow(1).eachCell({ includeEmpty: false }, (cell, colNumber) => {
    headers[colNumber] = String(cell.value ?? "").trim();
  });

  const rows: Record<string, unknown>[] = [];
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const obj: Record<string, unknown> = {};
    let hasValue = false;
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      const header = headers[colNumber];
      if (!header) return;
      const value = cell.value;
      if (value !== null && value !== undefined && value !== "") {
        hasValue = true;
      }
      obj[header] = value;
    });
    if (hasValue) rows.push(obj);
  });

  return { rows };
}

export async function parseScheduleFile(
  buffer: Buffer,
  filename: string
): Promise<ScheduleImportResult> {
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
  const missing = (Object.keys(HEADER_ALIASES) as ColumnKey[]).filter(
    (key) => !headerMap[key]
  );
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

  type RaceAccumulator = {
    raceNumber: number;
    laps: number;
    gates: Map<
      number,
      {
        gateNumber: number;
        classEntries: { className: string; numRacers: number }[];
      }
    >;
  };

  const races = new Map<number, RaceAccumulator>();

  for (let i = 0; i < rawRows.length; i++) {
    const rowNumber = i + 2; // header row is row 1
    const row = rawRows[i];

    const raceRaw = String(row[headerMap.race!] ?? "").trim();
    const lapsRaw = String(row[headerMap.laps!] ?? "").trim();
    const gateRaw = String(row[headerMap.gate!] ?? "").trim();
    const classNameRaw = String(row[headerMap.className!] ?? "").trim();
    const racersRaw = String(row[headerMap.racers!] ?? "").trim();

    if (!raceRaw && !classNameRaw && !gateRaw && !lapsRaw && !racersRaw) {
      continue; // fully blank row
    }

    const raceNumber = Number(raceRaw);
    const laps = Number(lapsRaw);
    const gateNumber = Number(gateRaw);
    const numRacers = racersRaw === "" ? 0 : Number(racersRaw);

    if (!Number.isInteger(raceNumber) || raceNumber < 1) {
      return {
        success: false,
        error: `Row ${rowNumber}: "Race #" must be a positive whole number.`,
      };
    }
    if (!Number.isInteger(laps) || laps < 1) {
      return {
        success: false,
        error: `Row ${rowNumber}: "Laps" must be a positive whole number.`,
      };
    }
    if (!Number.isInteger(gateNumber) || gateNumber < 1) {
      return {
        success: false,
        error: `Row ${rowNumber}: "Gate Drop #" must be a positive whole number.`,
      };
    }
    if (!classNameRaw) {
      return {
        success: false,
        error: `Row ${rowNumber}: "Class Name" is required.`,
      };
    }
    if (!Number.isInteger(numRacers) || numRacers < 0) {
      return {
        success: false,
        error: `Row ${rowNumber}: "# of Racers" must be a whole number (0 or more).`,
      };
    }

    let race = races.get(raceNumber);
    if (!race) {
      race = { raceNumber, laps, gates: new Map() };
      races.set(raceNumber, race);
    } else if (race.laps !== laps) {
      return {
        success: false,
        error: `Row ${rowNumber}: Race ${raceNumber} already has ${race.laps} laps set on an earlier row, but this row says ${laps}. All gate drops in a race must use the same number of laps.`,
      };
    }

    let gate = race.gates.get(gateNumber);
    if (!gate) {
      gate = { gateNumber, classEntries: [] };
      race.gates.set(gateNumber, gate);
    }
    gate.classEntries.push({ className: classNameRaw, numRacers });
  }

  if (races.size === 0) {
    return { success: false, error: "No usable race rows were found in the file." };
  }

  const sortedRaces = [...races.values()].sort(
    (a, b) => a.raceNumber - b.raceNumber
  );

  const lineup: LineupInput = {
    races: sortedRaces.map((race) => ({
      raceNumber: race.raceNumber,
      laps: race.laps,
      gateDrops: [...race.gates.values()]
        .sort((a, b) => a.gateNumber - b.gateNumber)
        .map((gate) => ({
          gateNumber: gate.gateNumber,
          classEntries: gate.classEntries,
        })),
    })),
  };

  const validated = lineupSchema.safeParse(lineup);
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0]?.message ?? "The file contains invalid data.",
    };
  }

  return { success: true, lineup: validated.data };
}
