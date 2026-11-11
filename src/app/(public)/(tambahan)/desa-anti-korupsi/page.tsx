'use client';
import { ANTIKORUPSI_BRAND_VARS } from '@/app/(public)/_com/main-page/desaantikorupsi/desaantikorupsi.meta';
import s from '@/app/(public)/_com/main-page/desaantikorupsi/desaantikorupsi.module.css';
import BackButton from '../../(pages)/pemerintahan/layanan/_com/BackButto';
import { AntiKorupsiUtama } from './_com/AntiKorupsiUtama';
import { useAntiKorupsiUtamaData } from './_com/antikorupsi-utama.data';

/** Halaman utama Desa Anti Korupsi: semua indikator per kategori, tiap butir membuka halaman programnya. */
function Page() {
  const { view, loading } = useAntiKorupsiUtamaData();

  return (
    <div className={`${s.section} ${s.pageLayout}`} style={ANTIKORUPSI_BRAND_VARS}>
      <div className={s.inner}>
        <div className={s.back}>
          <BackButton />
        </div>
        <AntiKorupsiUtama view={view} loading={loading} />
      </div>
    </div>
  );
}

export default Page;
