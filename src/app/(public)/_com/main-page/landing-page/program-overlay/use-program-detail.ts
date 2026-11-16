import { useEffect, useState } from "react";
import type { DetailState } from "./program-overlay.logic";
import { loadProgramInovasiDetail } from "./program-overlay.source";

/**
 * Muat detail program setiap kali `programId` dibuka (null = tertutup, tidak memuat). Respons untuk id yang sudah
 * diganti/ditutup dibuang. Hasil terakhir tetap disimpan saat ditutup (isi tidak hilang selama animasi tutup),
 * tetapi dikosongkan saat dibuka lagi agar galat/data lama tidak tampil sebagai hasil muat baru. Galat dilog
 * dengan konteks lalu menjadi `error`. Hasil berlabel id: pemakai menganggap id lain = masih memuat.
 */
export function useProgramDetail(programId: string | null): DetailState | null {
  const [state, setState] = useState<DetailState | null>(null);
  const [openedId, setOpenedId] = useState(programId);
  if (programId !== openedId) {
    setOpenedId(programId);
    if (programId !== null) setState(null);
  }

  useEffect(() => {
    if (programId === null) return;
    let current = true;
    loadProgramInovasiDetail(programId).then(
      (data) => {
        if (current) setState({ id: programId, status: "ready", data });
      },
      (error: unknown) => {
        console.error(`Gagal memuat detail program inovasi ${programId} (overlay beranda):`, error);
        if (current) setState({ id: programId, status: "error" });
      },
    );
    return () => {
      current = false;
    };
  }, [programId]);

  return state;
}
