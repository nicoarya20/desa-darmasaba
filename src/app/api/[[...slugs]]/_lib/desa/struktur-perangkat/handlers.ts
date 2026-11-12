import prisma from "@/lib/prisma";
import { createStrukturHandlers } from "../../_struktur-organisasi";

/** Handler Struktur Perangkat Desa: tabel `PosisiPerangkatDesa` + `PerangkatDesa` (tanpa `deletedAt` → hapus sungguhan). */
export const strukturPerangkatHandlers = createStrukturHandlers({
  posisi: () => prisma.posisiPerangkatDesa,
  pegawai: () => prisma.perangkatDesa,
  pegawaiLabel: "Perangkat desa",
  pegawaiLabelLower: "perangkat desa",
  softDelete: false,
});
