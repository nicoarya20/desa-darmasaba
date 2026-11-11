'use client';
import stateLayananDesa from '@/app/admin/(dashboard)/_state/desa/layananDesa';
import LayananWaktuBiayaBadge from '@/components/LayananWaktuBiayaBadge';
import { IconArrowUpRight, IconFileDescription } from '@tabler/icons-react';
import { useEffect } from 'react';
import { useSnapshot } from 'valtio';
import { LayananSection } from './LayananSection';
import { externalHref, type TelunjukSaktiItem } from './layanan.logic';
import { LAYANAN_LIST_LIMIT } from './layanan.meta';
import page from './layanan.module.css';
import s from './layanan-info.module.css';
import { LAYANAN_TEXT } from './layanan.text';

const T = LAYANAN_TEXT.telunjuk;
const PLACEHOLDER_COUNT = 3;

/** Bagian Telunjuk Sakti Desa: panel baris, tiap baris membuka dokumen petunjuk di tab baru. */
function PelayananTelunjukSaktiDesa() {
  const snap = useSnapshot(stateLayananDesa.pelayananTelunjukSaktiDesa.findMany);

  useEffect(() => {
    void stateLayananDesa.pelayananTelunjukSaktiDesa.findMany.load(1, LAYANAN_LIST_LIMIT);
  }, []);

  const loading = snap.loading || snap.data === null;
  const items = (snap.data ?? []) as TelunjukSaktiItem[];

  return (
    <LayananSection title={T.title} lead={T.lead}>
      {loading ? (
        <ul className={s.panel} aria-busy="true" aria-label={T.loading}>
          {Array.from({ length: PLACEHOLDER_COUNT }, (_, i) => (
            <li key={i} aria-hidden>
              <span className={s.rowPlaceholder} />
            </li>
          ))}
        </ul>
      ) : items.length === 0 ? (
        <p className={page.empty}>{T.empty}</p>
      ) : (
        <ul className={s.panel} aria-label={T.listLabel}>
          {items.map((item) => (
            <li key={item.id}>
              <a className={s.row} href={externalHref(item.link)} target="_blank" rel="noopener noreferrer">
                <span className={s.rowIcon} aria-hidden>
                  <IconFileDescription size={22} stroke={1.6} />
                </span>
                <span className={s.rowBody}>
                  <span className={s.rowTitle}>{item.name}</span>
                  {item.deskripsi ? <span className={s.rowLink}>{item.deskripsi}</span> : null}
                  <LayananWaktuBiayaBadge estimasiWaktu={item.estimasiWaktu} biaya={item.biaya} />
                </span>
                <IconArrowUpRight className={s.rowArrow} size={20} aria-hidden />
                <span className={page.srOnly}>({T.linkHint})</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </LayananSection>
  );
}

export default PelayananTelunjukSaktiDesa;
