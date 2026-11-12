import prisma from "@/lib/prisma";
import { createStrukturHandlers } from "../../_struktur-organisasi";

/**
 * Handler Struktur BUMDes: tabel `PosisiOrganisasiBumDes` + `PegawaiBumDes` (tanpa `deletedAt` → hapus sungguhan).
 * Tabel lama `StrukturOrganisasiBumDes` (tak pernah ditulis kode, FK RESTRICT) bisa merujuk baris yang dihapus:
 * rujukannya dibersihkan dalam transaksi yang sama agar hapus tidak gagal FK. `StrukturBumDes` ber-FK SET NULL.
 */
export const strukturBumdesHandlers = createStrukturHandlers({
  posisi: () => prisma.posisiOrganisasiBumDes,
  pegawai: () => prisma.pegawaiBumDes,
  pegawaiLabel: "Pegawai BUMDes",
  pegawaiLabelLower: "pegawai BUMDes",
  softDelete: false,
  hardDelete: {
    posisi: (id) =>
      prisma.$transaction([
        prisma.strukturOrganisasiBumDes.deleteMany({ where: { posisiOrganisasiId: id } }),
        prisma.posisiOrganisasiBumDes.delete({ where: { id } }),
      ]),
    pegawai: (id) =>
      prisma.$transaction([
        prisma.strukturOrganisasiBumDes.deleteMany({ where: { pegawaiId: id } }),
        prisma.pegawaiBumDes.delete({ where: { id } }),
      ]),
  },
});
