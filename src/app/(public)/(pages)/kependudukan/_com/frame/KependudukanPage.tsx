'use client';
import { KabarListHeader } from '@/app/(public)/_com/kabar-list/KabarListHeader';
import { KABAR_BRAND_VARS } from '@/app/(public)/_com/main-page/kabar-desa/kabar.meta';
import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';
import { useMenuVisibility } from '@/app/(public)/_com/MenuVisibilityContext';
import { AgamaSection } from '../agama/AgamaSection';
import { BanjarSection } from '../banjar/BanjarSection';
import { useKependudukanData } from '../data/use-kependudukan-data';
import { DinamikaSection } from '../dinamika/DinamikaSection';
import { UmurSection } from '../umur/UmurSection';
import s from './frame.module.css';
import { KependudukanHero } from './KependudukanHero';
import { KependudukanTerkait } from './KependudukanTerkait';
import { KEPENDUDUKAN_TEXT as T } from './kependudukan.text';
import { SectionNav } from './SectionNav';
import { NAV_SECTIONS } from './section-nav.logic';
import { useHashScroll } from './use-section-nav';

const NO_TABS = [] as const;
const noSearch = () => {};

/**
 * Dashboard Kependudukan (gabungan 5 halaman lama): kepala Kabar, rel pil sticky, ringkasan, lalu section Per Banjar,
 * Umur, Agama, Dinamika, dan tautan terkait.
 * Empat dataset dimuat paralel sekali; tiap section memakai tahun terbaru datasetnya sendiri.
 */
export function KependudukanPage() {
  const data = useKependudukanData();
  const { hiddenHrefs } = useMenuVisibility();
  const settled = Object.values(data).every((slice) => slice.status !== 'loading');
  useHashScroll(NAV_SECTIONS, settled);

  return (
    <div className={`${kabar.section} ${s.page}`} style={KABAR_BRAND_VARS}>
      <KabarListHeader
        title={T.title}
        lead={T.lead}
        searchLabel={T.searchLabel}
        searchPlaceholder={T.searchLabel}
        kategoriLabel={T.kategoriLabel}
        tabs={NO_TABS}
        search=""
        onSearch={noSearch}
        searchable={false}
      />
      <SectionNav sections={NAV_SECTIONS} />
      <div className={s.stack}>
        <KependudukanHero banjar={data.banjar} dinamika={data.dinamika} />
        <BanjarSection data={data.banjar} />
        <UmurSection data={data.umur} />
        <AgamaSection data={data.agama} />
        <DinamikaSection data={data.dinamika} />
        <KependudukanTerkait hiddenHrefs={hiddenHrefs} />
      </div>
    </div>
  );
}
