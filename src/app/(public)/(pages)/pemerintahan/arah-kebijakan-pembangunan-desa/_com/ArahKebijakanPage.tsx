'use client'
import { useLoadOnce } from "@/app/(public)/_com/load-once/use-load-once";
import type { JenisDokumen } from "@/lib/dokumen-perencanaan";
import { useState } from "react";
import { kategoriTampil } from "./arah-kebijakan.logic";
import { loadAdaBeritaAcara } from "./arah-kebijakan.source";
import { ArahKebijakanView } from "./ArahKebijakanView";
import { useDokumenKategori } from "./use-dokumen-kategori";

/** Halaman publik Arah Kebijakan Pembangunan Desa: memuat dokumen per kategori (tab) dan per halaman. */
export function ArahKebijakanPage() {
  const [kategori, setKategori] = useState<JenisDokumen>("RPJM");
  const [page, setPage] = useState(1);
  const { state, retry } = useDokumenKategori(kategori, page);
  // Gagal memeriksa berita acara = tab disembunyikan (galat sudah dilog oleh useLoadOnce); empat kategori utama tetap jalan.
  const beritaAcara = useLoadOnce(loadAdaBeritaAcara, "keberadaan berita acara (Arah Kebijakan Pembangunan Desa)");
  const adaBeritaAcara = beritaAcara.status === "ready" && beritaAcara.data;

  return (
    <ArahKebijakanView
      kategoriList={kategoriTampil(adaBeritaAcara)}
      kategori={kategori}
      onKategoriChange={(value) => { setKategori(value); setPage(1); }}
      state={state}
      page={page}
      onPageChange={setPage}
      onRetry={retry}
    />
  );
}
