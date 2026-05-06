import prisma from "@/lib/prisma";
import { Context } from "elysia";

type CctvInput = {
  kode: string;
  nama: string;
  lokasi: string;
  latitude?: number;
  longitude?: number;
  status?: "Online" | "Offline";
  lastActive?: string;
};

const cctvCreate = async (context: Context) => {
  const { kode, nama, lokasi, latitude, longitude, status, lastActive } =
    (await context.body) as CctvInput;

  const data = await prisma.cctvKeamanan.create({
    data: {
      kode,
      nama,
      lokasi,
      latitude,
      longitude,
      status: status ?? "Online",
      lastActive: lastActive ? new Date(lastActive) : new Date(),
    },
  });

  return { success: true, data };
};

export default cctvCreate;
