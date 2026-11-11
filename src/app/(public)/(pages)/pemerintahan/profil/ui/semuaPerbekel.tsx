'use client'
import stateProfileDesa from '@/app/admin/(dashboard)/_state/desa/profile';
import { Image, Skeleton } from '@mantine/core';
import { IconUserFilled } from '@tabler/icons-react';
import { useId } from 'react';
import { useProxy } from 'valtio/utils';
import { ProfilHeading } from '../_com/ProfilCard';
import { RIWAYAT_PERBEKEL_LIMIT } from '../_com/profil.meta';
import { PROFIL_TEXT } from '../_com/profil.text';
import { useLoadOnce } from '../_com/use-load-once';
import r from './riwayat-perbekel.module.css';

const T = PROFIL_TEXT.riwayat;
const SKELETON_COUNT = 3;

/** Section Perbekel dari Masa ke Masa: grid kartu potret (foto, nama, wilayah, periode) berurutan dari CMS. */
function SemuaPerbekel() {
  const id = useId();
  const state = useProxy(stateProfileDesa.mantanPerbekel);
  const loaded = useLoadOnce(() => state.findMany.load(1, RIWAYAT_PERBEKEL_LIMIT));
  const { data } = state.findMany;

  let content;
  if (!loaded && !data) {
    content = (
      <div className={r.grid} role="status" aria-label={T.loading}>
        {Array.from({ length: SKELETON_COUNT }, (_, i) => (
          <Skeleton key={i} className={r.skeleton} radius={24} />
        ))}
      </div>
    );
  } else if (!data || data.length === 0) {
    content = <p className={r.empty}>{T.empty}</p>;
  } else {
    content = (
      <ul className={r.grid}>
        {data.map((item) => (
          <li key={item.id} className={r.card}>
            <div className={r.photo}>
              {item.image?.link ? (
                <Image src={item.image.link} alt={item.nama} className={r.photoImage} loading="lazy" />
              ) : (
                <IconUserFilled className={r.silhouette} aria-hidden />
              )}
            </div>
            <div className={r.body}>
              <h3 className={r.name}>{item.nama}</h3>
              <p className={r.area}>{item.daerah}</p>
              <p className={r.period}>{item.periode}</p>
            </div>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <section aria-labelledby={id}>
      <ProfilHeading id={id} title={T.title} />
      {content}
    </section>
  );
}

export default SemuaPerbekel;
