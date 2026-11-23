import type { ReactNode } from 'react';
import ScrollToTopButton from '@/app/(public)/_com/scrollToTopButton';
import { PpidPage } from '../../ppid/_com/PpidPage';
import { ProfilNav } from './_com/ProfilNav';
import { StrukturPerangkatSection } from './_com/StrukturPerangkat';
import { PROFIL_ANCHOR as A, PROFIL_VARS } from './_com/profil.meta';
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

/** Pembungkus section sebagai tujuan tombol `ProfilNav`; `tabIndex=-1` agar bisa menerima fokus setelah gulir. */
function Anchored({ id, children }: { id: string; children: ReactNode }) {
  return (
    <div id={id} className={s.anchor} tabIndex={-1}>
      {children}
    </div>
  );
}

/**
 * Halaman Profil Desa: kerangka halaman PPID (kembali + judul + pengantar), tombol loncat ke tiap section, lalu section berurutan —
 * identitas desa (sejarah, visi misi, wilayah, lambang, maskot) kemudian pemerintahan (perbekel, struktur, moto, riwayat).
 */
function Page() {
  return (
    <PpidPage title={PROFIL_TEXT.title} lead={PROFIL_TEXT.lead} style={PROFIL_VARS}>
      <ProfilNav />
      <div className={s.sections}>
        <Anchored id={A.sejarah}><SejarahDesa /></Anchored>
        <Anchored id={A.visiMisi}><VisiMisiDesa /></Anchored>
        <Anchored id={A.wilayah}><WilayahDesa /></Anchored>
        <Anchored id={A.lambang}><LambangDesa /></Anchored>
        <Anchored id={A.maskot}><MaskotDesa /></Anchored>
        <Anchored id={A.perbekel}><ProfilPerbekel /></Anchored>
        <Anchored id={A.struktur}><StrukturPerangkatSection /></Anchored>
        <Anchored id={A.moto}><MotoDesa /></Anchored>
        <Anchored id={A.riwayat}><SemuaPerbekel /></Anchored>
      </div>
      <ScrollToTopButton />
    </PpidPage>
  );
}

export default Page;
