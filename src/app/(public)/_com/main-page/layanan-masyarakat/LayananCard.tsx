import type { LayananDesa } from "@/con/layanan-desa";
import { IconChevronRight } from "@tabler/icons-react";
import Link from "next/link";
import { LAYANAN_ICONS } from "./layanan-masyarakat.meta";
import s from "./layanan-masyarakat.module.css";

type LayananCardProps = { item: LayananDesa; onOpenPengaduan: () => void };

/** Satu kartu layanan: seluruh kartu bisa diklik — tautan halaman, atau tombol pembuka modal pengaduan. */
export function LayananCard({ item, onOpenPengaduan }: LayananCardProps) {
  const Icon = LAYANAN_ICONS[item.id];
  const body = (
    <>
      <span className={s.icon} aria-hidden>
        <Icon size={26} stroke={1.75} />
      </span>
      <h3 className={s.cardTitle}>{item.title}</h3>
      <p className={s.cardBody}>{item.description}</p>
      <span className={s.cardCta}>
        {item.cta}
        <IconChevronRight size={16} stroke={2} aria-hidden />
      </span>
    </>
  );

  return "link" in item ? (
    <Link href={item.link} className={s.card}>
      {body}
    </Link>
  ) : (
    <button type="button" className={s.card} onClick={onOpenPengaduan} aria-haspopup="dialog">
      {body}
    </button>
  );
}
