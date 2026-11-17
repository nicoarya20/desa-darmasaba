'use client';
import { KabarListHeader } from '@/app/(public)/_com/kabar-list/KabarListHeader';
import { useLoadOnce } from '@/app/(public)/_com/load-once/use-load-once';
import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';
import { BUMDES_VARS } from './bumdes.meta';
import s from './bumdes.module.css';
import { loadDokumen, loadGaleri, loadProfil, loadUnitUsaha } from './bumdes.source';
import { BUMDES_TEXT as T } from './bumdes.text';
import { DokumenBumdes } from './DokumenBumdes';
import { PengurusBumdes } from './PengurusBumdes';
import { ProfilBumdes } from './ProfilBumdes';
import { UnitUsahaBumdes } from './UnitUsahaBumdes';

/** Kolom cari kepala tidak dipakai: cari nama/jabatan ada di bagian Struktur Pengurus. */
const noop = () => {};

/**
 * Halaman BUMDes di `.section` Kabar Desa: kepala (kembali, judul, pengantar), profil (+ galeri), unit usaha,
 * struktur pengurus, lalu SK & dokumen (hanya bila ada). Tiap bagian dimuat terpisah; galat satu bagian tidak
 * menyembunyikan yang lain.
 */
export function BumdesPage() {
  const profil = useLoadOnce(loadProfil, 'profil (BUMDes)');
  const galeri = useLoadOnce(loadGaleri, 'galeri foto (BUMDes)');
  const unitUsaha = useLoadOnce(loadUnitUsaha, 'unit usaha (BUMDes)');
  const dokumen = useLoadOnce(loadDokumen, 'SK & dokumen (BUMDes)');

  return (
    <div className={kabar.section} style={BUMDES_VARS}>
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
        <ProfilBumdes profil={profil} galeri={galeri} />
        <UnitUsahaBumdes state={unitUsaha} />
        <PengurusBumdes />
        {dokumen.status === 'ready' ? <DokumenBumdes items={dokumen.data} /> : null}
      </div>
    </div>
  );
}
