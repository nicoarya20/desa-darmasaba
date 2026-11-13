import prisma from "@/lib/prisma";
import { createStrukturHandlers } from "../../_struktur-organisasi";

/**
 * Handler Struktur PPID: tabel `PosisiOrganisasiPPID` + `PegawaiPPID`. Keduanya punya `deletedAt` dan dirujuk
 * tabel lama (`StrukturPPID`, `StrukturOrganisasiPPID`), jadi hapus = soft-delete agar tidak gagal FK.
 */
export const strukturPpidHandlers = createStrukturHandlers({
  posisi: () => prisma.posisiOrganisasiPPID,
  pegawai: () => prisma.pegawaiPPID,
  pegawaiLabel: "Pegawai PPID",
  pegawaiLabelLower: "pegawai PPID",
  softDelete: true,
  fileOwner: "PegawaiPPID",
});
