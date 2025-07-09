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
  const prevYear = currentMonthIndex > 0 ? body.year : body.year - 1;

  const prevData = await prisma.detailDataPengangguran.findFirst({
    where: {
      month: prevMonth,
      year: prevYear,
    },
  });

  let percentageChange: number | null = null;
  if (prevData) {
    const change = ((body.totalUnemployment - prevData.totalUnemployment) / prevData.totalUnemployment) * 100;
    percentageChange = parseFloat(change.toFixed(1));
  }

  const created = await prisma.detailDataPengangguran.create({
    data: {
      month: body.month,
      year: body.year,
      totalUnemployment: body.totalUnemployment,
      educatedUnemployment: body.educatedUnemployment,
      uneducatedUnemployment: body.uneducatedUnemployment,
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
