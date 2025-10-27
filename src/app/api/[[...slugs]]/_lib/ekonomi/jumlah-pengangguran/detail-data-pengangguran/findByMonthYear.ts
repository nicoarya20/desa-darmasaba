import prisma from "@/lib/prisma";


export default async function findByMonthYear({ params }: { params: { month: string; year: number } }) {
  const { month, year } = params;

  if (!month || !year) {
    return {
      success: false,
      message: "Bulan dan tahun wajib diisi",
      data: null,
    };
  }

  const data = await prisma.detailDataPengangguran.findFirst({
    where: {
      month,
      year: Number(year),
    },
  });

  if (!data) {
    return {
      success: false,
      message: `Data untuk bulan ${month} tahun ${year} tidak ditemukan`,
      data: null,
    };
  }

  return {
    success: true,
    message: "Data ditemukan",
    data,
  };
}
