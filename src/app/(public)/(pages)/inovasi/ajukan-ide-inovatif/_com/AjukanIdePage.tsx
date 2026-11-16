'use client';
import { KabarListHeader } from '@/app/(public)/_com/kabar-list/KabarListHeader';
import { KABAR_BRAND_VARS } from '@/app/(public)/_com/main-page/kabar-desa/kabar.meta';
import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';
import { PermohonanLayout } from '../../../ppid/_com/PermohonanLayout';
import form from '../../_com/inovasi-form.module.css';
import { AJUKAN_IDE_TEXT as T } from './ajukan-ide.text';
import { IdeAside } from './IdeAside';
import { IdeForm } from './IdeForm';
import s from './ajukan-ide.module.css';

const noSearch = () => {};

/**
 * Halaman Ajukan Ide Inovatif di `.section` Kabar Desa: kepala (kembali, judul, pengantar; tanpa cari), lalu tata
 * letak 2 kolom PPID: kiri tujuan + alur + Musyawarah (menempel di desktop), kanan formulir langsung tanpa modal;
 * saat bertumpuk (< 75em) formulir tampil lebih dulu. `form.fullWidth`: kartu formulir sampai tepi kanan halaman.
 */
export function AjukanIdePage() {
  return (
    <div className={kabar.section} style={KABAR_BRAND_VARS}>
      <KabarListHeader
        title={T.title}
        lead={T.lead}
        searchLabel={T.searchLabel}
        searchPlaceholder=""
        kategoriLabel={T.kategoriLabel}
        tabs={[]}
        search=""
        onSearch={noSearch}
        searchable={false}
      />
      <div className={`${form.fullWidth} ${s.formFirst}`}>
        <PermohonanLayout aside={<IdeAside />}>
          <IdeForm />
        </PermohonanLayout>
      </div>
    </div>
  );
}
