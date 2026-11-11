import { IconChevronRight } from "@tabler/icons-react";
import { Link } from "next-view-transitions";
import { formatTanggalKabar, type KabarItem } from "./kabar.logic";
import { KABAR_PENGUMUMAN_LIMIT, PENGUMUMAN_BASE_HREF } from "./kabar.meta";
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
        <Link href={PENGUMUMAN_BASE_HREF} className={s.textLink}>
          {KABAR_TEXT.pengumumanAll}
          <IconChevronRight size={16} stroke={2} aria-hidden />
        </Link>
      </div>
      <ul className={s.list} aria-busy={loading || undefined}>
        {loading
          ? Array.from({ length: KABAR_PENGUMUMAN_LIMIT }, (_, i) => (
              <li key={i} className={s.rowPlaceholder} aria-hidden />
            ))
          : items.map((item) => (
              <li key={item.id}>
                <Link href={item.href} className={s.row}>
                  <span className={s.rowTitle}>{item.title}</span>
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
