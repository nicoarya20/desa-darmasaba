import { IconChevronRight } from "@tabler/icons-react";
import { Link } from "next-view-transitions";
import r from "../../link-reveal/link-reveal.module.css";
import { SkeletonText } from "../../skeleton-text/SkeletonText";
import { formatTanggalKabar, type KabarItem } from "./kabar.logic";
import { KABAR_PENGUMUMAN_LIMIT, KABAR_SKELETON_CHARS, PENGUMUMAN_BASE_HREF } from "./kabar.meta";
import s from "./kabar.pengumuman.module.css";
import { KABAR_TEXT } from "./kabar.text";

const HEADING_ID = "kabar-pengumuman-title";

/** Daftar teks pengumuman terbaru (sengaja tanpa gambar agar panel beranda ringkas). */
export function KabarPengumuman({ items, loading }: { items: readonly KabarItem[]; loading: boolean }) {
  if (!loading && items.length === 0) return null;

  return (
    <section className={s.pengumuman} aria-labelledby={HEADING_ID}>
      <div className={s.head}>
        <h3 id={HEADING_ID} className={s.title}>
          {KABAR_TEXT.pengumumanTitle}
        </h3>
        <Link href={PENGUMUMAN_BASE_HREF} className={`${s.textLink} ${r.trigger}`}>
          <span className={r.cta} data-text={KABAR_TEXT.pengumumanAll}>
            {KABAR_TEXT.pengumumanAll}
          </span>
          <IconChevronRight className={r.chevron} size={16} stroke={2} aria-hidden />
        </Link>
      </div>
      <ul className={s.list} aria-busy={loading || undefined}>
        {loading
          ? // Kerangka baris = grid baris asli (judul, tanggal, chevron) dengan teks contoh: di ponsel judul 2 baris
            // + tanggal di bawahnya, di desktop satu baris, sama seperti isi.
            Array.from({ length: KABAR_PENGUMUMAN_LIMIT }, (_, i) => (
              <li key={i} aria-hidden>
                <div className={s.row}>
                  <span className={s.rowTitle}>
                    <SkeletonText chars={KABAR_SKELETON_CHARS.pengumumanTitle} />
                  </span>
                  <span className={s.rowDate}>
                    <SkeletonText chars={KABAR_SKELETON_CHARS.date} />
                  </span>
                  <IconChevronRight className={s.rowChevron} size={18} stroke={1.75} aria-hidden />
                </div>
              </li>
            ))
          : items.map((item) => (
              <li key={item.id}>
                <Link href={item.href} className={`${s.row} ${r.trigger}`}>
                  <span className={s.rowTitle}>
                    <span className={r.title}>{item.title}</span>
                  </span>
                  <time className={s.rowDate} dateTime={new Date(item.createdAt).toISOString()}>
                    {formatTanggalKabar(item.createdAt)}
                  </time>
                  <IconChevronRight className={s.rowChevron} size={18} stroke={1.75} aria-hidden />
                </Link>
              </li>
            ))}
      </ul>
    </section>
  );
}
