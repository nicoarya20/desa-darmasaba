'use client';
import { KabarListHeader } from '@/app/(public)/_com/kabar-list/KabarListHeader';
import { useLoadOnce } from '@/app/(public)/_com/load-once/use-load-once';
import apb from '@/app/(public)/_com/main-page/apbdes/apbdes.module.css';
import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';
import { IconChevronRight } from '@tabler/icons-react';
import { Link } from 'next-view-transitions';
import { PadesaBody } from './PadesaBody';
import { PADESA_APBDES_HREF } from './padesa.meta';
import s from './padesa.module.css';
import { loadPadesa } from './padesa.source';
import { PADESA_TEXT as T } from './padesa.text';

const noop = () => {};

/**
 * Halaman Pendapatan Asli Desa di kerangka Kabar (menu Ekonomi): kepala tanpa cari/pil, lalu isi dari APBDes pos 4.1
 * (ringkasan, rincian, atau kotak kosong/galat) dan tautan ke APBDes lengkap yang selalu tampil.
 */
export function PadesaPage() {
  const state = useLoadOnce(loadPadesa, 'APBDes pos 4.1 (Pendapatan Asli Desa)');

  return (
    <div className={kabar.section}>
      <KabarListHeader
        title={T.title}
        lead={T.lead}
        searchLabel={T.searchLabel}
        searchPlaceholder={T.searchLabel}
        kategoriLabel={T.kategoriLabel}
        tabs={[]}
        search=""
        onSearch={noop}
        searchable={false}
      />
      <div className={s.body}>
        <PadesaBody state={state} />
        <p className={s.cta}>
          <Link href={PADESA_APBDES_HREF} className={apb.ctaLink}>
            {T.cta}
            <IconChevronRight size={18} stroke={2} aria-hidden />
          </Link>
        </p>
      </div>
    </div>
  );
}
