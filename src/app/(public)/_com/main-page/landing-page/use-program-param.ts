import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect } from "react";
import { programOverlayHref, readProgramParam } from "./program-param.logic";

// Benar bila overlay dibuka lewat router.push di sesi ini, sehingga entri riwayat sebelumnya adalah beranda
// tanpa param dan menutup cukup dengan back. Hilang saat reload (variabel modul) → tautan langsung ditutup replace.
let openedByPush = false;

/** Membuka overlay program tanpa membaca search params (aman dipakai hero tanpa Suspense). */
export function useProgramOpen() {
  const router = useRouter();
  return useCallback(
    (id: string) => {
      openedByPush = true;
      router.push(programOverlayHref(id), { scroll: false });
    },
    [router],
  );
}

/** Id program dari `?program=` + penutup overlay yang menjaga tombol back dan posisi gulir beranda. */
export function useProgramParam() {
  const router = useRouter();
  const programId = readProgramParam(useSearchParams());

  useEffect(() => {
    // Ditutup lewat tombol back browser (atau navigasi lain) → penanda tidak berlaku lagi.
    if (programId === null) openedByPush = false;
  }, [programId]);

  const close = useCallback(() => {
    const viaBack = openedByPush;
    openedByPush = false;
    if (viaBack) router.back();
    else router.replace("/", { scroll: false });
  }, [router]);

  return { programId, close };
}
