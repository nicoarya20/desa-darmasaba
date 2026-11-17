import { IconChevronRight } from '@tabler/icons-react';
import type { DokumenBumdes as Dokumen } from './bumdes.logic';
import s from './bumdes.module.css';
import { BUMDES_TEXT } from './bumdes.text';

const T = BUMDES_TEXT.dokumen;
const TITLE_ID = 'bumdes-dokumen-title';

/**
 * Bagian "SK & Dokumen": baris bergaris (judul, keterangan) + "Unduh" (tab baru). Daftar kosong → tidak dirender
 * sama sekali (keputusan user 2026-11-16: tanpa kotak kosong selama backend belum menyediakan dokumen).
 */
export function DokumenBumdes({ items }: { items: readonly Dokumen[] }) {
  if (items.length === 0) return null;
  return (
    <section className={s.block} aria-labelledby={TITLE_ID}>
      <h2 id={TITLE_ID} className={s.blockTitle}>
        {T.title}
      </h2>
      <ul className={s.docs} aria-label={T.listLabel}>
        {items.map((doc) => (
          <li key={doc.id} className={s.doc}>
            <div>
              <p className={s.docTitle}>{doc.judul}</p>
              {doc.keterangan ? <p className={s.docNote}>{doc.keterangan}</p> : null}
            </div>
            <a href={doc.href} target="_blank" rel="noopener noreferrer" className={s.docLink} aria-label={T.unduhLabel(doc.judul)}>
              {T.unduh}
              <IconChevronRight size={16} stroke={2} aria-hidden />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
