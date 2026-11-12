import { jadwalToText } from "@/lib/jadwal-pelayanan";
import { Image } from "@mantine/core";
import { IconCalendarTime, IconChevronRight, IconHeartHandshake, IconPhone } from "@tabler/icons-react";
import { Link } from "next-view-transitions";
import { useState } from "react";
import { banjarLabel, posyanduDetailHref, telHref } from "./posyandu.logic";
import type { PosyanduItem } from "./posyandu.source";
import { POSYANDU_TEXT as T } from "./posyandu.text";
import r from "./posyandu-rows.module.css";

/**
 * Satu baris direktori: foto (hanya bila ada; tanpa foto → ikon di kotak putih, bukan gambar "No image") ·
 * banjar + nama + jadwal · pil telepon (tel:) · chevron. Seluruh baris = tautan detail lewat tautan nama yang diregangkan.
 */
export function PosyanduRow({ item }: { item: PosyanduItem }) {
  const jadwal = jadwalToText(item.jadwalPelayanan);
  const nomor = item.nomor?.trim() ?? "";
  const tel = telHref(nomor);

  return (
    <li className={r.row}>
      <Thumb link={item.image?.link} />
      <div className={r.main}>
        <p className={r.kicker}>{item.banjar?.name ? banjarLabel(item.banjar.name) : T.banjarKosong}</p>
        <Link href={posyanduDetailHref(item.id)} className={r.name}>
          {item.name}
        </Link>
        <p className={`${r.jadwal} ${jadwal ? "" : r.kosong}`}>
          <IconCalendarTime size={16} stroke={1.75} aria-hidden className={r.jadwalIcon} />
          <span>{jadwal || T.jadwalKosong}</span>
        </p>
      </div>
      <div className={r.actions}>
        {tel ? (
          <a href={tel} className={r.call} aria-label={T.telepon(nomor)}>
            <IconPhone size={16} stroke={1.75} aria-hidden />
            <span>{nomor}</span>
          </a>
        ) : (
          <span className={r.kosong}>{T.nomorKosong}</span>
        )}
      </div>
      <IconChevronRight className={r.chevron} size={18} stroke={1.75} aria-hidden />
    </li>
  );
}

/** Foto 64px bila ada dan berhasil dimuat; tanpa foto atau tautan foto rusak → ikon di kotak putih (bukan gambar "No image"). */
function Thumb({ link }: { link?: string | null }) {
  const [broken, setBroken] = useState(false);
  if (!link || broken) {
    return (
      <span className={`${r.thumb} ${r.thumbFallback}`} aria-hidden>
        <IconHeartHandshake size={26} stroke={1.5} />
      </span>
    );
  }
  // Dekoratif (alt kosong): nama posyandu sudah menjadi nama tautan.
  return <Image src={link} alt="" className={r.thumb} loading="lazy" decoding="async" onError={() => setBroken(true)} />;
}
