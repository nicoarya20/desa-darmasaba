'use client'
import stateProfileDesa from '@/app/admin/(dashboard)/_state/desa/profile';
import { Image } from '@mantine/core';
import { useProxy } from 'valtio/utils';
import { ProfilCard, ProfilCardSkeleton, ProfilEmpty, ProfilProse } from '../_com/ProfilCard';
import { MASKOT_ICON_SRC, PROFIL_CMS_ID } from '../_com/profil.meta';
import { PROFIL_TEXT } from '../_com/profil.text';
import { useLoadOnce } from '../_com/use-load-once';
import m from './media.module.css';

const T = PROFIL_TEXT.maskot;

/** Section Maskot Desa: lambang Sekar Pudak, keterangan dari CMS, lalu galeri foto berlabel. */
function MaskotDesa() {
  const state = useProxy(stateProfileDesa.maskotDesa);
  const loaded = useLoadOnce(() => state.findUnique.load(PROFIL_CMS_ID));
  const { data } = state.findUnique;

  if (!loaded && !data) return <ProfilCardSkeleton label={T.loading} rows={6} />;

  const images = (data?.images ?? []).filter((img) => !!img.image?.link);
  return (
    <ProfilCard title={T.title} emblem={{ src: MASKOT_ICON_SRC, alt: T.iconAlt }}>
      {data?.deskripsi ? <ProfilProse html={data.deskripsi} /> : <ProfilEmpty>{T.empty}</ProfilEmpty>}
      {images.length > 0 ? (
        <ul className={m.gallery}>
          {images.map((img, index) => (
            <li key={img.id ?? index}>
              <figure className={m.photo}>
                <Image src={img.image?.link} alt={img.label} className={m.photoImage} loading="lazy" />
                <figcaption className={m.photoCaption}>{img.label}</figcaption>
              </figure>
            </li>
          ))}
        </ul>
      ) : (
        <ProfilEmpty>{T.noImages}</ProfilEmpty>
      )}
    </ProfilCard>
  );
}

export default MaskotDesa;
