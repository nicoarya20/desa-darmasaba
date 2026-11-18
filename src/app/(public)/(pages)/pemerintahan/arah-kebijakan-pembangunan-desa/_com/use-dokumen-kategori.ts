import { useCallback, useEffect, useState } from "react";
import type { LoadState } from "@/app/(public)/_com/load-once/use-load-once";
import type { JenisDokumen } from "@/lib/dokumen-perencanaan";
import type { ArahDokumenPage } from "./arah-kebijakan.logic";
import { loadDokumenKategori } from "./arah-kebijakan.source";

/** Muat satu halaman dokumen satu kategori; ganti kategori/halaman memuat ulang, `retry` mengulang setelah gagal. */
export function useDokumenKategori(jenis: JenisDokumen, page: number) {
  const [state, setState] = useState<LoadState<ArahDokumenPage>>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });
    loadDokumenKategori(jenis, page).then(
      (data) => {
        if (!cancelled) setState({ status: "ready", data });
      },
      (error: unknown) => {
        console.error(`Gagal memuat dokumen ${jenis} (Arah Kebijakan Pembangunan Desa):`, error);
        if (!cancelled) setState({ status: "error" });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [jenis, page, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  return { state, retry };
}
