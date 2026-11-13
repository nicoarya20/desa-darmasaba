import { createStrukturModule } from "../../_struktur-organisasi";
import { strukturPpidHandlers } from "./handlers";

/**
 * API Struktur PPID (`/ppid/strukturppid/{posisiorganisasi,pegawai}`) — path lama dipertahankan, kode bersama
 * dengan Struktur Perangkat Desa (`_struktur-organisasi`).
 */
const StrukturPPID = createStrukturModule(
  {
    prefix: "/strukturppid",
    posisiPath: "/posisiorganisasi",
    pegawaiPath: "/pegawai",
    tag: "PPID/Struktur PPID",
    logTag: "strukturppid",
  },
  strukturPpidHandlers
);

export default StrukturPPID;
