import p from '@/app/(public)/(pages)/ppid/_com/permohonan.module.css';
import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';
import { useId } from 'react';
import s from './administrasi.module.css';
import { ADMINISTRASI_TEXT as T } from './administrasi.text';
import type { JenisLayananState } from './use-jenis-layanan';

const PLACEHOLDER_ROWS = 3;

/** Daftar jenis layanan yang bisa diajukan (nama + keterangan dari admin), di kolom kiri di bawah alur pengajuan. */
export function JenisLayananSection({ jenis }: { jenis: JenisLayananState }) {
  const titleId = useId();
  return (
    <section aria-labelledby={titleId}>
      <h2 id={titleId} className={p.stepsTitle}>
        {T.jenisTitle}
      </h2>
      <JenisLayananList jenis={jenis} />
    </section>
  );
}

function JenisLayananList({ jenis }: { jenis: JenisLayananState }) {
  if (jenis.status === 'loading') {
    return (
      <ul className={s.jenisList} aria-busy="true" aria-label={T.jenisLoading}>
        {Array.from({ length: PLACEHOLDER_ROWS }, (_, i) => (
          <li key={i} className={`${s.jenisPlaceholder} ${kabar.placeholder}`} aria-hidden />
        ))}
      </ul>
    );
  }
  if (jenis.status === 'error') return <p className={s.note}>{T.jenisError}</p>;
  if (jenis.items.length === 0) return <p className={s.note}>{T.jenisEmpty}</p>;
  return (
    <dl className={s.jenisList}>
      {jenis.items.map((item) => (
        <div key={item.id} className={s.jenis}>
          <dt className={s.jenisName}>{item.nama}</dt>
          {item.deskripsi ? <dd className={s.jenisDesc}>{item.deskripsi}</dd> : null}
        </div>
      ))}
    </dl>
  );
}
