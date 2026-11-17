import { StatBarsEmpty, StatBarsError, StatBarsSkeleton } from '@/app/(public)/_com/stat-bars/StatBarsStates';
import { STAT_BARS_VARS } from '@/app/(public)/_com/stat-bars/stat-bars.meta';
import sb from '@/app/(public)/_com/stat-bars/stat-bars.module.css';
import { formatSelisih } from '@/lib/dinamika-penduduk';
import { IconArrowsExchange } from '@tabler/icons-react';
import type { DatasetSlice } from '../data/kependudukan-data.types';
import { DinamikaLegend, DinamikaNeraca } from './DinamikaNeraca';
import { DinamikaRiwayat } from './DinamikaRiwayat';
import { parseDinamikaRows, ringkasDinamika } from './dinamika.logic';
import s from './dinamika.module.css';
import { DINAMIKA_TEXT as T } from './dinamika.text';

/**
 * Section `#dinamika` Dashboard Kependudukan: neraca tahun terbaru (bertambah = lahir + masuk vs berkurang = mati + keluar)
 * + perubahan bersih, lalu riwayat semua tahun di balik disclosure. Galat ≠ kosong.
 */
export function DinamikaSection({ data }: { data: DatasetSlice }) {
  return (
    <section id={T.anchor} aria-labelledby={T.titleId} className={s.section}>
      <DinamikaBody data={data} />
    </section>
  );
}

/** Isi section; judul `h2#dinamika-title` ada di semua keadaan (muat, galat, kosong, siap). */
function DinamikaBody({ data }: { data: DatasetSlice }) {
  if (data.status === 'loading') {
    return <StatBarsSkeleton title={T.title} titleId={T.titleId} label={T.loading} rows={2} />;
  }
  if (data.status === 'error') {
    return <StatBarsError title={T.title} titleId={T.titleId} message={T.error} onRetry={data.retry} />;
  }
  const latest = parseDinamikaRows(data.rows)[0];
  if (!latest) {
    return <StatBarsEmpty icon={<IconArrowsExchange size={24} stroke={1.75} />} title={T.title} titleId={T.titleId} body={T.empty} />;
  }
  const riwayat = parseDinamikaRows(data.allRows);
  const r = ringkasDinamika(latest);
  return (
    <div className={sb.panel} style={STAT_BARS_VARS}>
      <div className={sb.head}>
        <div>
          <h2 id={T.titleId} className={sb.title}>
            {T.title}
          </h2>
          <p className={sb.caption}>{T.caption}</p>
          <p className={s.meta}>{T.dataTahun(latest.tahun)}</p>
          <DinamikaLegend />
        </div>
        <p className={sb.total}>
          <span className={sb.totalLabel}>{T.bersihLabel}</span>
          <span className={sb.totalValue}>
            {formatSelisih(r.bersih)}
            <span className={sb.totalUnit}>{T.orang}</span>
          </span>
        </p>
      </div>
      <DinamikaNeraca ringkasan={r} />
      <p className={sb.note}>
        {T.pertumbuhanAlami} <strong className={s.angka}>{formatSelisih(r.pertumbuhanAlami)}</strong> ({T.rumusAlami}) ·{' '}
        {T.migrasiBersih} <strong className={s.angka}>{formatSelisih(r.migrasiBersih)}</strong> ({T.rumusMigrasi})
      </p>
      {riwayat.length > 1 ? <DinamikaRiwayat rows={riwayat} tahunAktif={latest.tahun} /> : null}
    </div>
  );
}
