import { useEffect, useState } from "react";
import type { JenisLayanan } from "./administrasi.logic";
import { loadJenisLayanan } from "./administrasi.source";

export type JenisLayananState =
  | { status: "loading" }
  | { status: "ready"; items: JenisLayanan[] }
  | { status: "error" };

/** Jenis layanan dimuat sekali saat halaman dibuka. */
export function useJenisLayanan(): JenisLayananState {
  const [state, setState] = useState<JenisLayananState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    loadJenisLayanan().then(
      (items) => {
        if (!cancelled) setState({ status: "ready", items });
      },
      (error: unknown) => {
        console.error("Gagal memuat jenis layanan administrasi online:", error);
        if (!cancelled) setState({ status: "error" });
      },
    );
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
