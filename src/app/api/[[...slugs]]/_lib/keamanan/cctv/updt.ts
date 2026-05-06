import prisma from "@/lib/prisma";
import { Context } from "elysia";

type CctvUpdateInput = {
  kode: string;
  nama: string;
  lokasi: string;
  latitude?: number;
  longitude?: number;
  status: "Online" | "Offline";
  lastActive?: string;
};

const cctvUpdate = async (context: Context) => {
  const id = context.params.id as string;
  const { kode, nama, lokasi, latitude, longitude, status, lastActive } =
    (await context.body) as CctvUpdateInput;

  try {
    const data = await prisma.cctvKeamanan.update({
      where: { id },
      data: {
        kode,
        nama,
        lokasi,
        latitude,
        longitude,
        status,
        lastActive: lastActive ? new Date(lastActive) : undefined,
      },
    });

    return { success: true, data };
  } catch (e) {
    console.error("Gagal update CCTV:", e);
    return { success: false, message: "Gagal memperbarui CCTV" };
  }
};

export default cctvUpdate;
