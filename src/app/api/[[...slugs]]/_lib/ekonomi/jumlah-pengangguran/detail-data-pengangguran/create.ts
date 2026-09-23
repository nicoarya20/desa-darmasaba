import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";

// Define month order for calculation
const monthOrder = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

type FormCreate = {
  month: string;
  year: number;
  totalUnemployment: number;
  educatedUnemployment: number;
  uneducatedUnemployment: number;
  percentageChange?: number; // Make it optional since we'll calculate it
};

export default async function createDetailDataPengangguran(context: Context) {
  const body = context.body as FormCreate;
  const yearNumber = parseInt(body.year.toString(), 10);

  if (isNaN(yearNumber)) {
    throw new Error("Year harus berupa angka");
  }

  // Find current month's index
  const currentMonthIndex = monthOrder.indexOf(body.month);
  if (currentMonthIndex === -1) {
    throw new Error("Bulan tidak valid");
  }

  // Guard duplikat: kombinasi (month, year) unik di schema (@@unique).
  // Cek dulu supaya bisa balikan pesan jelas, bukan 500 dari P2002.
  const duplicate = await prisma.detailDataPengangguran.findFirst({
    where: { month: body.month, year: yearNumber },
  });
  if (duplicate) {
    context.set.status = 409;
    return {
      success: false,
      message: `Data bulan ${body.month} tahun ${yearNumber} sudah terpakai. Silakan edit data yang ada atau pilih bulan lain.`,
    };
  }

  // Calculate previous month and year
  let prevMonthIndex = currentMonthIndex - 1;
  let prevYear = yearNumber;
  
  if (prevMonthIndex < 0) {
    prevMonthIndex = 11; // December of previous year
    prevYear--; // Decrement year
  }
  
  const prevMonth = monthOrder[prevMonthIndex];

  // Find previous month's data
  const prevMonthData = await prisma.detailDataPengangguran.findFirst({
    where: {
      month: prevMonth,
      year: prevYear,
    },
    orderBy: { year: 'desc' },
  });

  // Calculate percentage change if previous data exists
  let percentageChange = 0;
  if (prevMonthData && prevMonthData.totalUnemployment > 0) {
    const change = ((body.totalUnemployment - prevMonthData.totalUnemployment) / 
                   prevMonthData.totalUnemployment) * 100;
    percentageChange = parseFloat(change.toFixed(1)); // Round to 1 decimal place
  } else if (body.percentageChange !== undefined) {
    // Fallback to provided value if no previous data
    percentageChange = Number(body.percentageChange) || 0;
  }

  try {
    const created = await prisma.detailDataPengangguran.create({
      data: {
        month: body.month,
        year: yearNumber,
        totalUnemployment: Number(body.totalUnemployment),
        educatedUnemployment: Number(body.educatedUnemployment),
        uneducatedUnemployment: Number(body.uneducatedUnemployment),
        percentageChange, // This is now calculated based on previous month's data
      },
      select: {
        id: true,
        month: true,
        year: true,
        totalUnemployment: true,
        educatedUnemployment: true,
        uneducatedUnemployment: true,
        percentageChange: true,
        createdAt: true,
      },
    });

    return {
      success: true,
      message: "Sukses menambahkan data pengangguran",
      data: created,
    };
  } catch (error) {
    // Jaring pengaman kalau ada race di antara cek duplikat dan create (P2002 = unique violation)
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      context.set.status = 409;
      return {
        success: false,
        message: `Data bulan ${body.month} tahun ${yearNumber} sudah terpakai. Silakan edit data yang ada atau pilih bulan lain.`,
      };
    }
    throw error;
  }
}
