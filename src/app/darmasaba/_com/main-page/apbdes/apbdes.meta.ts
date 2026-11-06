import colors from "@/con/colors";
import { IconBuildingBank, IconCash, IconReceipt2, type Icon } from "@tabler/icons-react";
import type { CSSProperties } from "react";
import type { Tipe } from "./apbdes.logic";

type TipeMeta = { icon: Icon; accent: string; tint: string };

/** Ikon + warna aksen per kategori (pengganti emoji lama). Warna netral, bukan penilaian baik/buruk. */
export const TIPE_META: Record<Tipe, TipeMeta> = {
  pendapatan: { icon: IconCash, accent: "var(--mantine-color-teal-7)", tint: "var(--mantine-color-teal-0)" },
  belanja: { icon: IconReceipt2, accent: colors["blue-button"], tint: colors["blue-button-1"] },
  pembiayaan: { icon: IconBuildingBank, accent: "var(--mantine-color-orange-7)", tint: "var(--mantine-color-orange-0)" },
};

/** Variabel CSS `--accent`/`--tint` untuk elemen bertema kategori. */
export function accentVars(tipe: Tipe): CSSProperties {
  const { accent, tint } = TIPE_META[tipe];
  return { "--accent": accent, "--tint": tint } as CSSProperties;
}
