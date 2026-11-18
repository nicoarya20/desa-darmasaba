import LayananWaktuBiayaBadge from "@/components/LayananWaktuBiayaBadge";
import { Image } from "@mantine/core";
import { Link } from "next-view-transitions";
import { imageLoadingAttrs } from "@/app/(public)/_com/image-loading.logic";
import type { SuratKeteranganItem } from "./layanan.logic";
import { layananDetailHref } from "./layanan.meta";
import s from "./layanan-surat.module.css";
import { LAYANAN_TEXT } from "./layanan.text";

/**
 * Kartu foto satu surat keterangan (gaya kartu galeri beranda); seluruh kartu menaut ke halaman detail.
 * `aboveFold`: foto kandidat LCP dimuat langsung dengan prioritas tinggi (lazy menunda unduhan sampai tata letak selesai).
 */
export function SuratKeteranganCard({ item, aboveFold = false }: { item: SuratKeteranganItem; aboveFold?: boolean }) {
  return (
    <Link href={layananDetailHref(item.id)} className={s.card}>
      {item.image?.link ? (
        <Image src={item.image.link} alt="" className={s.image} {...imageLoadingAttrs(aboveFold)} decoding="async" />
      ) : null}
      <span className={s.shade} aria-hidden />
      <div className={s.badge}>
        <LayananWaktuBiayaBadge estimasiWaktu={item.estimasiWaktu} biaya={item.biaya} onDark />
      </div>
      <div className={s.caption}>
        <h3 className={s.name}>{item.name}</h3>
        <span className={s.pill} aria-hidden>
          {LAYANAN_TEXT.surat.cta}
        </span>
      </div>
    </Link>
  );
}
