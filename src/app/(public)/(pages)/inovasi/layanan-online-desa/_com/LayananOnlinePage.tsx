'use client';
import PengaduanMasyarakatModal from '@/app/(public)/_com/pengaduan/PengaduanMasyarakatModal';
import { KabarListHeader } from '@/app/(public)/_com/kabar-list/KabarListHeader';
import { BERITA_LIST_HREF, KABAR_BRAND_VARS, PENGUMUMAN_BASE_HREF } from '@/app/(public)/_com/main-page/kabar-desa/kabar.meta';
import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';
import { IconFileCheck, IconMessageCircleQuestion, IconNews } from '@tabler/icons-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { LayananTile } from './LayananTile';
import { PengaduanRekapSection } from './rekap/PengaduanRekapSection';
import { isPengaduanRequested } from './layanan-online.logic';
import { ADMINISTRASI_ONLINE_HREF, LAYANAN_ONLINE_HREF, LAYANAN_PARAM } from './layanan-online.meta';
import s from './layanan-online.module.css';
import { LAYANAN_ONLINE_TEXT as T } from './layanan-online.text';

const ICON_SIZE = 32;
const ICON_STROKE = 1.5;

/**
 * Hub Layanan Online Desa di `.section` Kabar: kepala tanpa cari, lalu tiga ubin (Administrasi → halaman formulir,
 * Pengaduan → modal pengaduan bersama, Informasi Desa → Berita/Pengumuman). `?layanan=pengaduan` membuka modal saat
 * dimuat (tujuan alih route lama `/pengaduan-masyarakat`); menutupnya membuang parameter itu dari URL.
 */
export function LayananOnlinePage() {
  const router = useRouter();
  const requested = isPengaduanRequested(useSearchParams().get(LAYANAN_PARAM));
  const [pengaduanOpen, setPengaduanOpen] = useState(requested);

  const closePengaduan = () => {
    setPengaduanOpen(false);
    if (requested) router.replace(LAYANAN_ONLINE_HREF, { scroll: false });
  };

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
        // Hub tanpa kolom cari (searchable=false), jadi onSearch tidak pernah dipanggil.
        onSearch={() => undefined}
        searchable={false}
      />
      <LayananOnlineTiles onPengaduan={() => setPengaduanOpen(true)} />
      <PengaduanRekapSection />
      <PengaduanMasyarakatModal opened={pengaduanOpen} onClose={closePengaduan} />
    </div>
  );
}

/** Tiga ubin layanan (diekspor untuk test). */
export function LayananOnlineTiles({ onPengaduan }: { onPengaduan: () => void }) {
  return (
    <ul className={s.tiles} aria-label={T.listLabel}>
      <LayananTile
        icon={<IconFileCheck size={ICON_SIZE} stroke={ICON_STROKE} />}
        title={T.administrasi.title}
        desc={T.administrasi.desc}
        actions={[{ label: T.administrasi.action, href: ADMINISTRASI_ONLINE_HREF }]}
      />
      <LayananTile
        icon={<IconMessageCircleQuestion size={ICON_SIZE} stroke={ICON_STROKE} />}
        title={T.pengaduan.title}
        desc={T.pengaduan.desc}
        actions={[{ label: T.pengaduan.action, onClick: onPengaduan }]}
      />
      <LayananTile
        icon={<IconNews size={ICON_SIZE} stroke={ICON_STROKE} />}
        title={T.informasi.title}
        desc={T.informasi.desc}
        actions={[
          { label: T.informasi.berita, href: BERITA_LIST_HREF },
          { label: T.informasi.pengumuman, href: PENGUMUMAN_BASE_HREF },
        ]}
      />
    </ul>
  );
}
