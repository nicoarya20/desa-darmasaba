import { IconArrowRight, IconClock, IconFolder } from '@tabler/icons-react';
import Link from 'next/link';
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
 * Daftar indikator satu kategori. Indikator yang sudah berisi dokumen = seluruh baris tautan ke halaman
 * programnya (folder & dokumen); indikator kosong tetap tampil sebagai tempat kosong "Dokumen belum tersedia".
 */
export function AntiKorupsiDokumenList({ rows, labelledBy }: { rows: readonly AntiKorupsiDokumenRow[]; labelledBy: string }) {
  return (
    <ul className={s.panel} aria-labelledby={labelledBy}>
      {rows.map((row) => {
        const { isi } = row;
        if (!isi) {
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

        const indikator = row.number ? `${row.number} ${row.text}` : row.text;
        return (
          <li key={row.id}>
            <Link className={`${s.row} ${s.rowLink}`} href={isi.href} aria-label={AK_DETAIL_TEXT.openLabel(indikator, isi.ringkasan)}>
              <RowBody row={row} />
              <span className={s.open} aria-hidden>
                <IconFolder size={18} stroke={1.75} />
                {isi.ringkasan}
                <IconArrowRight size={16} stroke={2} />
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
