import prisma from "@/lib/prisma";
import type { Context } from "elysia";

type FormUpdate = {
  month: string;
  year: number;
  totalUnemployment: number;
  educatedUnemployment: number;
  uneducatedUnemployment: number;
  percentageChange?: number;
};

const monthOrder = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
];

export default async function detailDataPengangguranUpdate(context: Context) {
  const id = context.params?.id as string;

  if (!id) {
    return { success: false, message: "ID tidak ditemukan" };
  }

  const body = context.body as FormUpdate;
  const {
    month,
    year: yearInput,
    totalUnemployment,
    educatedUnemployment,
    uneducatedUnemployment,
  } = body;

  // 🔍 Cek duplikat (kecuali current id)
  const duplicate = await prisma.detailDataPengangguran.findFirst({
    where: {
      month,
      year: Number(yearInput),
      NOT: { id },
    },
  });

  if (duplicate) {
    return {
      success: false,
      message: `Data bulan ${month} ${yearInput} sudah ada.`,
    };
  }

  // 🔍 Cek data sekarang
  const current = await prisma.detailDataPengangguran.findUnique({ where: { id } });

  if (!current) {
    return { success: false, message: "Data tidak ditemukan" };
  }

  // 🔢 Cari data bulan sebelumnya
  const currentMonthIndex = monthOrder.indexOf(month);
  const prevMonth = currentMonthIndex > 0 ? monthOrder[currentMonthIndex - 1] : "Des";
  const prevYear = currentMonthIndex > 0 ? yearInput : yearInput - 1;

  const prevData = await prisma.detailDataPengangguran.findFirst({
    where: {
      month: prevMonth,
      year: prevYear,
    },
  });

  // 📊 Hitung percentageChange
  let percentageChange: number | null = null;
  if (prevData && prevData.totalUnemployment > 0) {
    const change =
      ((Number(totalUnemployment) - Number(prevData.totalUnemployment)) /
        Number(prevData.totalUnemployment)) *
      100;
    percentageChange = parseFloat(change.toFixed(1));
  }

  // ✏️ Update data
  const updated = await prisma.detailDataPengangguran.update({
    where: { id },
    data: {
      month,
      year: yearInput,
      totalUnemployment: Number(totalUnemployment),
      educatedUnemployment: Number(educatedUnemployment),
      uneducatedUnemployment: Number(uneducatedUnemployment),
      percentageChange,
    },
  });

  return {
    success: true,
    message: "Data berhasil diupdate",
    data: updated,
  };
}
