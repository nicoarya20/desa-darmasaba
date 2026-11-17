'use client';
import r from '@/app/(public)/_com/link-reveal/link-reveal.module.css';
import { IconChevronDown } from '@tabler/icons-react';
import { useId, useState } from 'react';
import type { Kolaborasi } from './kolaborasi.logic';
import { KOLABORASI_COLLAPSE_THRESHOLD } from './kolaborasi.meta';
import s from './kolaborasi.module.css';
import { KOLABORASI_TEXT as T } from './kolaborasi.text';

/**
 * Satu baris bergaris: kiri judul + ringkasan, kanan deskripsi + "Bersama: {kolaborator}". Deskripsi panjang
 * (> ambang) dipotong 4 baris dan dibuka di tempat dengan tombol `aria-expanded`; deskripsi pendek tampil penuh.
 * HTML deskripsi sudah disaring `sanitizeRichText` di `toKolaborasi`.
 */
export function KolaborasiRow({ item }: { item: Kolaborasi }) {
  const bodyId = useId();
  const [open, setOpen] = useState(false);
  const collapsible = Boolean(item.html) && item.textLength > KOLABORASI_COLLAPSE_THRESHOLD;
  const collapsed = collapsible && !open;
  const toggleLabel = open ? T.readLess : T.readMore;

  return (
    <li className={s.row}>
      <div className={s.head}>
        <h3 className={s.title}>{item.title}</h3>
        {item.summary ? <p className={s.summary}>{item.summary}</p> : null}
      </div>
      <div className={s.body}>
        {item.html ? (
          <div
            id={bodyId}
            className={collapsed ? `${s.prose} ${s.clamped}` : s.prose}
            dangerouslySetInnerHTML={{ __html: item.html }}
          />
        ) : null}
        {collapsible ? (
          <button
            type="button"
            className={`${s.toggle} ${r.trigger}`}
            aria-expanded={open}
            aria-controls={bodyId}
            onClick={() => setOpen((value) => !value)}
          >
            {/* Chevron bawah sudah berputar saat terbuka; sengaja tanpa `r.chevron` (geser kanan bentrok rotate). */}
            <span className={r.cta} data-text={toggleLabel}>
              {toggleLabel}
            </span>
            <IconChevronDown className={s.toggleIcon} size={16} stroke={2} aria-hidden />
          </button>
        ) : null}
        {item.partners ? (
          <p className={s.partners}>
            <span className={s.partnersLabel}>{T.partnersLabel}:</span> {item.partners}
          </p>
        ) : null}
      </div>
    </li>
  );
}
