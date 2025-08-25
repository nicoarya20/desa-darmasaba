// import prisma from "@/lib/prisma";
// import { Prisma } from "@prisma/client";
// import { Context } from "elysia";

// type FormCreate = Prisma.DetailDataPengangguranGetPayload<{
//   select: {
//     month: true;
//     year: true;
//     totalUnemployment: true;
//     educatedUnemployment: true;
//     uneducatedUnemployment: true;
//     percentageChange: true;
//   };
// }>;

// export default async function detailDataPengangguranCreate(context: Context) {
//   const body = context.body as FormCreate;

//   // Cek apakah data untuk bulan & tahun tersebut sudah ada
//   const existing = await prisma.detailDataPengangguran.findFirst({
//     where: {
//       month: body.month,
//       year: body.year,
//     },
//   });

//   if (existing) {
//     return {
//       success: false,
//       message: `Data bulan ${body.month} ${body.year} sudah ada.`,
//       data: null,
//     };
//   }

//   const created = await prisma.detailDataPengangguran.create({
//     data: {
//       month: body.month,
//       year: body.year,
//       totalUnemployment: body.totalUnemployment,
//       educatedUnemployment: body.educatedUnemployment,
//       uneducatedUnemployment: body.uneducatedUnemployment,
//       percentageChange: body.percentageChange ?? null,
//     },
//     select: {
//       id: true,
//       month: true,
//       year: true,
//       totalUnemployment: true,
//       educatedUnemployment: true,
//       uneducatedUnemployment: true,
//       percentageChange: true,
//     },
//   });

//   return {
//     success: true,
//     message: "Berhasil menambahkan data pengangguran bulanan",
//     data: created,
//   };
// }

import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";

type FormCreate = Prisma.DetailDataPengangguranGetPayload<{
  select: {
    month: true;
    year: true;
    totalUnemployment: true;
    educatedUnemployment: true;
    uneducatedUnemployment: true;
  };
}>;

const monthOrder = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

export default async function detailDataPengangguranCreate(context: Context) {
  const body = context.body as FormCreate;

  const existing = await prisma.detailDataPengangguran.findFirst({
    where: {
      month: body.month,
      year: body.year,
    },
  });

  if (existing) {
    return {
      success: false,
      message: `Data bulan ${body.month} ${body.year} sudah ada.`,
      data: null,
    };
  }

  // Cari bulan sebelumnya
  const currentMonthIndex = monthOrder.indexOf(body.month);
  const prevMonth = currentMonthIndex > 0 ? monthOrder[currentMonthIndex - 1] : "Des";
  
  // Handle year as number for calculations
  const currentYear = typeof body.year === 'number' ? body.year : new Date(body.year).getFullYear();
  const prevYear = currentMonthIndex > 0 ? currentYear : currentYear - 1;
  
  // Create date objects for Prisma
  const currentYearDate = new Date(currentYear, 0, 1);
  const prevYearDate = new Date(prevYear, 0, 1);
  
  const prevData = await prisma.detailDataPengangguran.findFirst({
    where: {
      month: prevMonth,
      year: prevYearDate,
    },
  });

  let percentageChange: number | null = null;
  if (prevData) {
    const change = ((Number(body.totalUnemployment) - Number(prevData.totalUnemployment)) / Number(prevData.totalUnemployment)) * 100;
    percentageChange = parseFloat(change.toFixed(1));
  }

  // Create the new record with properly typed values
  const created = await prisma.detailDataPengangguran.create({
    data: {
      month: body.month,
      year: currentYearDate,
      totalUnemployment: Number(body.totalUnemployment),
      educatedUnemployment: Number(body.educatedUnemployment),
      uneducatedUnemployment: Number(body.uneducatedUnemployment),
      percentageChange,
    },
    select: {
      id: true,
      month: true,
      year: true,
      totalUnemployment: true,
      educatedUnemployment: true,
      uneducatedUnemployment: true,
      percentageChange: true,
    },
  });

  return {
    success: true,
    message: "Berhasil menambahkan data pengangguran bulanan",
    data: created,
  };
}
