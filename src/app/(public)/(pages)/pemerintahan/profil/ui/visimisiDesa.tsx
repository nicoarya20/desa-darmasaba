'use client'
import stateProfileDesa from '@/app/admin/(dashboard)/_state/desa/profile';
import { useProxy } from 'valtio/utils';
import { VisiMisiContent } from '../../../ppid/visi-misi-ppid/_com/VisiMisiContent';
import { ProfilCard, ProfilCardSkeleton, ProfilEmpty } from '../_com/ProfilCard';
import { PROFIL_CMS_ID } from '../_com/profil.meta';
import { PROFIL_TEXT } from '../_com/profil.text';
import { useLoadOnce } from '../_com/use-load-once';

const T = PROFIL_TEXT.visiMisi;
const LABELS = { visi: T.visi, misi: T.misi, logoAlt: PROFIL_TEXT.logoAlt };

/** Section Visi dan Misi Desa: kartu yang sama dengan halaman Visi Misi PPID (lambang, visi, misi bernomor). */
function VisiMisiDesa() {
  const state = useProxy(stateProfileDesa.visiMisiDesa);
  const loaded = useLoadOnce(() => state.findUnique.load(PROFIL_CMS_ID));
  const { data } = state.findUnique;

  if (!loaded && !data) return <ProfilCardSkeleton label={T.loading} rows={7} />;
  if (!data) {
    return (
      <ProfilCard title={T.title}>
        <ProfilEmpty>{T.empty}</ProfilEmpty>
      </ProfilCard>
    );
  }
  return <VisiMisiContent visi={data.visi} misi={data.misi} labels={LABELS} />;
}

export default VisiMisiDesa;
