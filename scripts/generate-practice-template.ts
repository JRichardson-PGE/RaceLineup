import ExcelJS from "exceljs";
import path from "node:path";

async function main() {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Practice");

  sheet.columns = [
    { header: "Practice #", key: "practice", width: 12 },
    { header: "Description", key: "description", width: 32 },
    { header: "Minutes", key: "minutes", width: 12 },
    { header: "Laps", key: "laps", width: 10 },
  ];
  sheet.getRow(1).font = { bold: true };

  const rows = [
    { practice: 1, description: "All classes 65cc and under", minutes: 15, laps: "" },
    { practice: 2, description: "All classes 85cc and over", minutes: "", laps: 5 },
  ];
  rows.forEach((row) => sheet.addRow(row));

  const outPath = path.join(
    process.cwd(),
    "public",
    "templates",
    "practice-schedule-template.xlsx"
  );
  await workbook.xlsx.writeFile(outPath);
  console.log(`Wrote ${outPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
