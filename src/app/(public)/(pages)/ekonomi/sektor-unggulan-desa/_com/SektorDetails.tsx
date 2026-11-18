import rt from '@/app/(public)/_com/rich-text/rich-text.module.css';
import rows from '../../../lingkungan/data-lingkungan-desa/_com/data-lingkungan.module.css';
import type { SektorSummary } from './sektor-unggulan.logic';
import s from './sektor-unggulan.module.css';
import { SEKTOR_UNGGULAN_TEXT as T } from './sektor-unggulan.text';

const TITLE_ID = 'sektor-unggulan-detail-title';

/**
 * Rincian deskripsi per sektor dalam urutan peringkat: baris bergaris Data Lingkungan (kiri nama + angka, kanan
 * deskripsi tersaring). Sektor tanpa deskripsi tidak diulang di sini; tanpa satu pun deskripsi → bagian tidak dirender.
 */
export function SektorDetails({ summary }: { summary: SektorSummary }) {
  const described = summary.stat.rows.filter((row) => row.html);
  if (described.length === 0) return null;
  return (
    <section aria-labelledby={TITLE_ID}>
      <h2 id={TITLE_ID} className={s.blockTitle}>
        {T.detailTitle}
      </h2>
      <ul className={rows.rows}>
        {described.map((row) => (
          <li key={row.id} className={rows.row}>
            <div className={rows.head}>
              <h3 className={rows.title}>{row.label}</h3>
              {row.figure ? <p className={rows.amount}>{row.figure}</p> : null}
            </div>
            {/* html sudah disaring sanitizeRichText di toSektor. */}
            <div className={`${rows.prose} ${rt.root}`} dangerouslySetInnerHTML={{ __html: row.html ?? '' }} />
          </li>
        ))}
      </ul>
    </section>
  );
}
