'use client'
import stateProfileDesa from '@/app/admin/(dashboard)/_state/desa/profile';
import { useProxy } from 'valtio/utils';
import { ProfilCard, ProfilCardSkeleton, ProfilEmpty, ProfilProse } from '../_com/ProfilCard';
import { LOGO_DESA_SRC, PROFIL_CMS_ID } from '../_com/profil.meta';
import { PROFIL_TEXT } from '../_com/profil.text';
import { useLoadOnce } from '../_com/use-load-once';

const T = PROFIL_TEXT.lambang;

/** Section Lambang Desa: lambang + keterangan makna dari CMS. */
function LambangDesa() {
  const state = useProxy(stateProfileDesa.lambangDesa);
  const loaded = useLoadOnce(() => state.findUnique.load(PROFIL_CMS_ID));
  const { data } = state.findUnique;

  if (!loaded && !data) return <ProfilCardSkeleton label={T.loading} />;
  return (
    <ProfilCard title={T.title} emblem={{ src: LOGO_DESA_SRC, alt: PROFIL_TEXT.logoAlt }}>
      {data?.deskripsi ? <ProfilProse html={data.deskripsi} /> : <ProfilEmpty>{T.empty}</ProfilEmpty>}
    </ProfilCard>
  );
}

export default LambangDesa;
