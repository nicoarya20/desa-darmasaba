import { IconBuildingBank, IconCash, IconReceipt2, type Icon } from "@tabler/icons-react";
import type { CSSProperties } from "react";
import type { Tipe } from "./apbdes.logic";

type TipeMeta = { icon: Icon; accent: string; tint: string };

/**
 * Ikon + warna aksen per kategori (pengganti emoji lama). Warna netral, bukan penilaian baik/buruk.
 * Nilai terang/gelapnya dideklarasikan di apbdes.module.css (`--apbdes-<tipe>-accent/-tint`), jadi ikut tema.
 */
export const TIPE_META: Record<Tipe, TipeMeta> = {
  pendapatan: { icon: IconCash, accent: "var(--apbdes-pendapatan-accent)", tint: "var(--apbdes-pendapatan-tint)" },
  belanja: { icon: IconReceipt2, accent: "var(--apbdes-belanja-accent)", tint: "var(--apbdes-belanja-tint)" },
  pembiayaan: {
    icon: IconBuildingBank,
    accent: "var(--apbdes-pembiayaan-accent)",
    tint: "var(--apbdes-pembiayaan-tint)",
  },
};

/** Variabel CSS `--accent`/`--tint` untuk elemen bertema kategori. */
export function accentVars(tipe: Tipe): CSSProperties {
  const { accent, tint } = TIPE_META[tipe];
  return { "--accent": accent, "--tint": tint } as CSSProperties;
}

/**
 * Variabel warna brand (teks/tautan + hover) untuk halaman yang memakai kerangka APBDes.
 * @deprecated Section beranda tidak lagi memakainya: `.section` apbdes.module.css sudah mengalias `--brand` ke token
 * `--c-brand`. Dipertahankan untuk halaman /apbdes dan menu lain (Fase 2/3 dark theme); nilainya token, jadi tema
 * terang identik dan tema gelap ikut. Tombol isi tidak memakai variabel ini (pakai --c-brand-fill).
 */
export const APBDES_BRAND_VARS = {
  "--brand": "var(--c-brand)",
  "--brand-hover": "var(--c-brand-hover)",
} as CSSProperties;
