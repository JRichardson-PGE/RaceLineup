import ExcelJS from "exceljs";
import path from "node:path";

async function main() {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Schedule");

  sheet.columns = [
    { header: "Race #", key: "race", width: 10 },
    { header: "Laps", key: "laps", width: 10 },
    { header: "Gate Drop #", key: "gate", width: 14 },
    { header: "Class Name", key: "className", width: 32 },
    { header: "# of Racers", key: "racers", width: 14 },
  ];
  sheet.getRow(1).font = { bold: true };

  const rows = [
    { race: 1, laps: 5, gate: 1, className: "250CC 4STK INTERMEDIATE", racers: 3 },
    { race: 1, laps: 5, gate: 1, className: "250CC 4STK NOVICE", racers: 7 },
    { race: 1, laps: 5, gate: 2, className: "250CC 4STK BEGINNER DIV 1", racers: 9 },
    { race: 2, laps: 4, gate: 1, className: "OT NOVICE", racers: 4 },
    { race: 2, laps: 4, gate: 2, className: "VET BEGINNER", racers: 3 },
  ];
  rows.forEach((row) => sheet.addRow(row));

  const outPath = path.join(
    process.cwd(),
    "public",
    "templates",
    "race-lineup-template.xlsx"
  );
  await workbook.xlsx.writeFile(outPath);
  console.log(`Wrote ${outPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
