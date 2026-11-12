import prisma from "@/lib/prisma";
import { createStrukturHandlers } from "../../_struktur-organisasi";

/** Handler Struktur BUMDes: tabel `PosisiOrganisasiBumDes` + `PegawaiBumDes` (tanpa `deletedAt` → hapus sungguhan). */
export const strukturBumdesHandlers = createStrukturHandlers({
  posisi: () => prisma.posisiOrganisasiBumDes,
  pegawai: () => prisma.pegawaiBumDes,
  pegawaiLabel: "Pegawai BUMDes",
  pegawaiLabelLower: "pegawai BUMDes",
  softDelete: false,
  fileOwner: "PegawaiBumDes",
});
