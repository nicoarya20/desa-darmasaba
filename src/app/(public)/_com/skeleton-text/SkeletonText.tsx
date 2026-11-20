import { skeletonSample } from "./skeleton-text.logic";
import s from "./skeleton-text.module.css";

/**
 * Pita kerangka sepanjang ±`chars` karakter, diletakkan di dalam elemen teks asli (judul, ringkasan, tanggal) agar
 * mewarisi font, lebar, dan line-clamp-nya. Teks contoh dipasang lewat atribut + `::before` (bukan teks DOM), jadi
 * tidak ikut terbaca mesin pencari, pembaca layar, atau salin-tempel; induk kerangka yang memberi label memuat.
 */
export function SkeletonText({ chars }: { chars: number }) {
  return <span className={s.text} data-sample={skeletonSample(chars)} aria-hidden />;
}
