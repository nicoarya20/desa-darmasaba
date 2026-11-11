import ScrollToTopButton from '@/app/darmasaba/_com/scrollToTopButton';
import { PpidPage } from '../../ppid/_com/PpidPage';
import { StrukturPerangkatSection } from './_com/StrukturPerangkat';
import { PROFIL_VARS } from './_com/profil.meta';
import s from './_com/profil.module.css';
import { PROFIL_TEXT } from './_com/profil.text';
import LambangDesa from './ui/lambangDesa';
import MaskotDesa from './ui/maskotDesa';
import MotoDesa from './ui/motoDesa';
import ProfilPerbekel from './ui/profilPerbekel';
import SejarahDesa from './ui/sejarahDesa';
import SemuaPerbekel from './ui/semuaPerbekel';
import VisiMisiDesa from './ui/visimisiDesa';
import WilayahDesa from './ui/wilayahDesa';

/**
 * Halaman Profil Desa: kerangka halaman PPID (kembali + judul + pengantar) lalu section berurutan —
 * identitas desa (sejarah, visi misi, wilayah, lambang, maskot) kemudian pemerintahan (perbekel, struktur, moto, riwayat).
 */
function Page() {
  return (
    <PpidPage title={PROFIL_TEXT.title} lead={PROFIL_TEXT.lead} style={PROFIL_VARS}>
      <div className={s.sections}>
        <SejarahDesa />
        <VisiMisiDesa />
        <WilayahDesa />
        <LambangDesa />
        <MaskotDesa />
        <ProfilPerbekel />
        <StrukturPerangkatSection />
        <MotoDesa />
        <SemuaPerbekel />
      </div>
      <ScrollToTopButton />
    </PpidPage>
  );
}

export default Page;
