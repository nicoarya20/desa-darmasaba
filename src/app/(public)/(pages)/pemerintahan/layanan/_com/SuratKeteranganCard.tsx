import LayananWaktuBiayaBadge from "@/components/LayananWaktuBiayaBadge";
import { Image } from "@mantine/core";
import { Link } from "next-view-transitions";
import type { SuratKeteranganItem } from "./layanan.logic";
import { layananDetailHref } from "./layanan.meta";
import s from "./layanan-surat.module.css";
import { LAYANAN_TEXT } from "./layanan.text";

/** Kartu foto satu surat keterangan (gaya kartu galeri beranda); seluruh kartu menaut ke halaman detail. */
export function SuratKeteranganCard({ item }: { item: SuratKeteranganItem }) {
  return (
    <Link href={layananDetailHref(item.id)} className={s.card}>
      {item.image?.link ? (
        <Image src={item.image.link} alt="" className={s.image} loading="lazy" decoding="async" />
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
