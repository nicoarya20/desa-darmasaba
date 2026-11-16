'use client';
import { useLoadOnce } from '@/app/(public)/_com/load-once/use-load-once';
import { KabarListHeader } from '@/app/(public)/_com/kabar-list/KabarListHeader';
import { KABAR_BRAND_VARS } from '@/app/(public)/_com/main-page/kabar-desa/kabar.meta';
import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';
import { BankSampahSteps } from './BankSampahSteps';
import { loadLangkah, loadLokasi } from './bank-sampah.source';
import s from './bank-sampah.module.css';
import { BANK_SAMPAH_TEXT as T } from './bank-sampah.text';
import { LokasiBankSampah } from './LokasiBankSampah';

/** Kolom cari kepala tidak dipakai: cari lokasi ada di bagian Lokasi, bukan di atas langkah yang tidak ikut tersaring. */
const noop = () => {};

/**
 * Halaman Bank Sampah di `.section` Kabar Desa: kepala (kembali, judul, pengantar), alur bernomor cara menabung,
 * lalu lokasi Bank Sampah (daftar + peta). Kedua bagian dimuat terpisah; galat satu bagian tidak menyembunyikan yang lain.
 */
export function BankSampahPage() {
  const langkah = useLoadOnce(loadLangkah, 'langkah Bank Sampah (Pengelolaan Sampah)');
  const lokasi = useLoadOnce(loadLokasi, 'lokasi Bank Sampah (Pengelolaan Sampah)');

  return (
    <div className={kabar.section} style={KABAR_BRAND_VARS}>
      <KabarListHeader
        title={T.title}
        lead={T.lead}
        searchLabel={T.searchLabel}
        searchPlaceholder={T.searchPlaceholder}
        kategoriLabel={T.kategoriLabel}
        tabs={[]}
        search=""
        onSearch={noop}
        searchable={false}
      />
      <div className={s.stack}>
        <BankSampahSteps state={langkah} />
        <LokasiBankSampah state={lokasi} />
      </div>
    </div>
  );
}
