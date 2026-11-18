import d from '@/app/(public)/_com/kabar-list/kabar-detail.module.css';
import rt from '@/app/(public)/_com/rich-text/rich-text.module.css';
import type { LayananUnggulanItem } from '@/lib/pustu/pustu.types';
import { PUSTU_TEXT as T } from '../pustu.text';
import s from '../pustu.module.css';

/** Kartu layanan unggulan PUSTU (judul + deskripsi singkat). */
export function LayananUnggulanGrid({ items }: { items: readonly LayananUnggulanItem[] }) {
  return (
    <ul className={s.cardGrid} data-testid="pustu-layanan">
      {items.map((l, i) => (
        <li key={i} className={s.card}>
          <h3 className={s.cardTitle}>{l.judul}</h3>
          {l.deskripsi ? <p className={s.cardText}>{l.deskripsi}</p> : null}
        </li>
      ))}
    </ul>
  );
}

/** Tarif layanan dua kolom: BPJS vs umum (HTML sudah disanitasi pemanggil); kolom kosong tidak dirender. */
export function TarifGrid({ bpjs, umum }: { bpjs: string; umum: string }) {
  return (
    <div className={s.cardGrid} data-testid="pustu-tarif">
      {bpjs ? (
        <section className={s.card} aria-label={T.tarifBpjs}>
          <p className={s.tarifLabel}>{T.tarifBpjs}</p>
          <div className={`${d.content} ${rt.root}`} dangerouslySetInnerHTML={{ __html: bpjs }} />
        </section>
      ) : null}
      {umum ? (
        <section className={s.card} aria-label={T.tarifUmum}>
          <p className={s.tarifLabel}>{T.tarifUmum}</p>
          <div className={`${d.content} ${rt.root}`} dangerouslySetInnerHTML={{ __html: umum }} />
        </section>
      ) : null}
    </div>
  );
}
