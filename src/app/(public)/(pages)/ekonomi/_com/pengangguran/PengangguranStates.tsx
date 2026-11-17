import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';
import { formatTanggal } from '@/app/(public)/_com/main-page/apbdes/apbdes.logic';
import { IconChevronRight } from '@tabler/icons-react';
import { Link } from 'next-view-transitions';
import s from './pengangguran.module.css';
import { PENGANGGURAN_TEXT as T } from './pengangguran.text';

/** Kotak #f5f5f7 satu kalimat untuk keadaan kosong ("akan tampil di sini") maupun galat. */
export function PengangguranNotice({ children }: { children: string }) {
  return <p className={kabar.empty}>{children}</p>;
}

/** Kerangka berdenyut halaman Jumlah Pengangguran: 3 kartu + panel grafik. */
export function PengangguranSkeleton({ label }: { label: string }) {
  return (
    <div className={s.stack} aria-busy="true" aria-label={label}>
      <div className={s.summary} aria-hidden>
        {[0, 1, 2].map((i) => (
          <div key={i} className={`${s.placeholder} ${s.placeholderCard}`} />
        ))}
      </div>
      <div className={`${s.placeholder} ${s.placeholderPanel}`} aria-hidden />
    </div>
  );
}

/** "Data diperbarui 2 November 2026" (WITA); tidak dirender bila tanggal tak terbaca. */
export function DiperbaruiCaption({ date }: { date: Date | null }) {
  return date ? <p className={s.caption}>{T.diperbarui(formatTanggal(date))}</p> : null;
}

/** Pil putih ke halaman pasangan (Jumlah ⇄ Sebaran); selalu tampil, juga saat data kosong. */
export function PengangguranCrossLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className={s.crossLink}>
      {label}
      <IconChevronRight size={18} stroke={1.75} aria-hidden />
    </Link>
  );
}
