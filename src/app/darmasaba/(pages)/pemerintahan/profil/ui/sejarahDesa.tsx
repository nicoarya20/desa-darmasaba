'use client'
import stateProfileDesa from '@/app/admin/(dashboard)/_state/desa/profile';
import { useProxy } from 'valtio/utils';
import { ProfilCard, ProfilCardSkeleton, ProfilEmpty, ProfilProse } from '../_com/ProfilCard';
import { PROFIL_CMS_ID } from '../_com/profil.meta';
import { PROFIL_TEXT } from '../_com/profil.text';
import { useLoadOnce } from '../_com/use-load-once';

const T = PROFIL_TEXT.sejarah;

/** Section Sejarah Desa: teks sejarah dari CMS dalam kartu terang. */
function SejarahDesa() {
  const state = useProxy(stateProfileDesa.sejarahDesa);
  const loaded = useLoadOnce(() => state.findUnique.load(PROFIL_CMS_ID));
  const { data } = state.findUnique;

  if (!loaded && !data) return <ProfilCardSkeleton label={T.loading} />;
  return (
    <ProfilCard title={T.title}>
      {data?.deskripsi ? <ProfilProse html={data.deskripsi} /> : <ProfilEmpty>{T.empty}</ProfilEmpty>}
    </ProfilCard>
  );
}

export default SejarahDesa;
