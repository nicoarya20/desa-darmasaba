import prisma from "../../seed-prisma";
import { loadJsonData } from "../../load-json";

const jumlahPengangguran = loadJsonData("ekonomi/jumlah-pengangguran/detail-data-pengangguran.json");

export async function seedJumlahPengangguran() {
  for (const d of jumlahPengangguran) {
    await prisma.detailDataPengangguran.upsert({
      where: {
        month_year: { month: d.month, year: d.year },
      },
      update: {
        totalUnemployment: d.totalUnemployment,
        educatedUnemployment: d.educatedUnemployment,
        uneducatedUnemployment: d.uneducatedUnemployment,
        percentageChange: d.percentageChange,
      },
      create: {
        month: d.month,
        year: d.year,
        totalUnemployment: d.totalUnemployment,
        educatedUnemployment: d.educatedUnemployment,
        uneducatedUnemployment: d.uneducatedUnemployment,
        percentageChange: d.percentageChange,
      },
    });
  }
  console.log("📊 detailDataPengangguran success ...");
}
