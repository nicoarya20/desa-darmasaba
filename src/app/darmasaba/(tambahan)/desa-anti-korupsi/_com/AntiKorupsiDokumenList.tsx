import { IconArrowUpRight, IconClock, IconFileText, IconFileTypePdf } from '@tabler/icons-react';
import type { AntiKorupsiDokumenRow } from './antikorupsi-detail.logic';
import s from './antikorupsi-detail.module.css';
import { AK_DETAIL_TEXT } from './antikorupsi-detail.text';

const PLACEHOLDER_ROWS = 5;

/** Kerangka daftar selama data dimuat. */
export function AntiKorupsiDokumenSkeleton() {
  return (
    <div className={s.panel} aria-hidden>
      {Array.from({ length: PLACEHOLDER_ROWS }, (_, i) => (
        <div key={i} className={s.rowPlaceholder} />
      ))}
    </div>
  );
}

function RowBody({ row }: { row: AntiKorupsiDokumenRow }) {
  return (
    <>
      {row.number ? <span className={s.number}>{row.number}</span> : null}
      <span className={s.text}>{row.text}</span>
    </>
  );
}

/**
 * Daftar indikator satu kategori. Indikator bersurat = seluruh baris tautan yang membuka file di tab baru;
 * indikator tanpa surat tetap tampil sebagai tempat kosong "Dokumen belum tersedia" sampai admin mengunggahnya.
 */
export function AntiKorupsiDokumenList({ rows, labelledBy }: { rows: readonly AntiKorupsiDokumenRow[]; labelledBy: string }) {
  return (
    <ul className={s.panel} aria-labelledby={labelledBy}>
      {rows.map((row) => {
        const { dokumen } = row;
        if (!dokumen) {
          return (
            <li key={row.id} className={s.row}>
              <RowBody row={row} />
              <span className={s.pending}>
                <IconClock size={16} stroke={1.75} aria-hidden />
                {AK_DETAIL_TEXT.pending}
              </span>
            </li>
          );
        }

        const Icon = dokumen.type === 'PDF' ? IconFileTypePdf : IconFileText;
        const indikator = row.number ? `${row.number} ${row.text}` : row.text;
        return (
          <li key={row.id}>
            <a
              className={`${s.row} ${s.rowLink}`}
              href={dokumen.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={AK_DETAIL_TEXT.openLabel(indikator, dokumen.type)}
            >
              <RowBody row={row} />
              <span className={s.open} aria-hidden>
                <Icon size={18} stroke={1.75} />
                {AK_DETAIL_TEXT.open(dokumen.type)}
                <IconArrowUpRight size={16} stroke={2} />
              </span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
