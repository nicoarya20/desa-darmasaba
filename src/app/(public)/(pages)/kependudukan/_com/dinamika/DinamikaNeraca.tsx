import { formatJumlah } from '@/app/(public)/_com/stat-bars/stat-bars.logic';
import { statSegmentColor } from '@/app/(public)/_com/stat-bars/stat-bars.meta';
import sb from '@/app/(public)/_com/stat-bars/stat-bars.module.css';
import seg from '@/app/(public)/_com/stat-bars/stat-segments.module.css';
import type { CSSProperties } from 'react';
import type { DinamikaRingkasan } from './dinamika.logic';
import { DINAMIKA_TEXT as T } from './dinamika.text';

/** Warna = sebab (segmen 0 alami: lahir/mati, segmen 1 perpindahan: masuk/keluar); baris = arah (bertambah/berkurang). */
const ALAMI = 0;
const PINDAH = 1;

type Arus = { id: string; label: string; total: number; lebar: number; parts: [{ label: string; value: number }, { label: string; value: number }] };

/** Legenda warna di kepala panel. */
export function DinamikaLegend() {
  return (
    <ul className={seg.legend}>
      {[T.alami, T.perpindahan].map((label, k) => (
        <li key={label} className={seg.legendItem}>
          <span className={seg.dot} style={{ background: statSegmentColor(k) }} aria-hidden />
          <span>{label}</span>
        </li>
      ))}
    </ul>
  );
}

/** Dua batang bertumpuk (Bertambah vs Berkurang) dengan rincian angka tercetak di bawah tiap batang. */
export function DinamikaNeraca({ ringkasan }: { ringkasan: DinamikaRingkasan }) {
  const { row, lebar } = ringkasan;
  const arus: Arus[] = [
    {
      id: 'bertambah',
      label: T.bertambah,
      total: ringkasan.bertambah,
      lebar: lebar.bertambah,
      parts: [{ label: T.kelahiran, value: row.kelahiran }, { label: T.masuk, value: row.masuk }],
    },
    {
      id: 'berkurang',
      label: T.berkurang,
      total: ringkasan.berkurang,
      lebar: lebar.berkurang,
      parts: [{ label: T.kematian, value: row.kematian }, { label: T.keluar, value: row.keluar }],
    },
  ];
  return (
    <ul className={sb.list} aria-labelledby={T.titleId}>
      {arus.map((a, i) => (
        <li key={a.id} className={`${sb.row} ${sb.hasSegs}`}>
          <span className={sb.name}>{a.label}</span>
          <span className={sb.track} aria-hidden>
            {a.total > 0 ? (
              <span className={`${sb.bar} ${sb.stack}`} style={{ width: `${a.lebar}%`, '--i': i } as CSSProperties}>
                {a.parts.map((p, k) =>
                  p.value > 0 ? (
                    <span key={p.label} className={sb.seg} style={{ flexGrow: p.value, background: statSegmentColor(k === 0 ? ALAMI : PINDAH) }} />
                  ) : null,
                )}
              </span>
            ) : null}
          </span>
          <span className={sb.figure}>
            <span className={sb.count}>{formatJumlah(a.total)}</span>
            <span className={sb.unit}>{T.orang}</span>
          </span>
          <span className={seg.segFigures}>
            {a.parts.map((p, k) => (
              <span key={p.label} className={seg.segFigure}>
                <span className={seg.dot} style={{ background: statSegmentColor(k === 0 ? ALAMI : PINDAH) }} aria-hidden />
                {p.label} <span className={seg.segValue}>{formatJumlah(p.value)}</span>
              </span>
            ))}
          </span>
        </li>
      ))}
    </ul>
  );
}
