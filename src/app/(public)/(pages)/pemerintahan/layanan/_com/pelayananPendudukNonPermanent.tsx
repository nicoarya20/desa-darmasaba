'use client';
import stateLayananDesa from '@/app/admin/(dashboard)/_state/desa/layananDesa';
import LayananWaktuBiayaBadge from '@/components/LayananWaktuBiayaBadge';
import { useEffect, useState } from 'react';
import { useSnapshot } from 'valtio';
import { LayananSection } from './LayananSection';
import type { LayananSingleton } from './layanan.logic';
import { LAYANAN_SINGLETON_ID } from './layanan.meta';
import page from './layanan.module.css';
import s from './layanan-info.module.css';
import { LAYANAN_TEXT } from './layanan.text';

const T = LAYANAN_TEXT.nonPermanen;

/** Bagian Penduduk Non-Permanen: judul & isi dari admin di panel abu, beserta badge waktu & biaya. */
function PelayananPendudukNonPermanent() {
  const snap = useSnapshot(stateLayananDesa.pelayananPendudukNonPermanen.findById);

  // `findById.data` tetap null saat gagal, jadi selesai-memuat dilacak terpisah agar tidak tertukar dengan "kosong".
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    let alive = true;
    void stateLayananDesa.pelayananPendudukNonPermanen.findById
      .load(LAYANAN_SINGLETON_ID)
      .finally(() => {
        if (alive) setSettled(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  const data = snap.data as LayananSingleton | null;

  return (
    <LayananSection
      title={data?.name?.trim() || T.fallbackTitle}
      meta={data ? <LayananWaktuBiayaBadge estimasiWaktu={data.estimasiWaktu} biaya={data.biaya} /> : null}
    >
      {!settled && !data ? (
        <span className={s.cardPlaceholder} aria-hidden />
      ) : data?.deskripsi ? (
        <div className={s.card}>
          {/* HTML dari editor admin (sumber tepercaya, pola sama dengan bagian lain halaman ini). */}
          <div className={s.richText} dangerouslySetInnerHTML={{ __html: data.deskripsi }} />
        </div>
      ) : (
        <p className={page.empty}>{T.empty}</p>
      )}
    </LayananSection>
  );
}

export default PelayananPendudukNonPermanent;
