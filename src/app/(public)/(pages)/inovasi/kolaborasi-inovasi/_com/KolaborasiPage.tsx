'use client';
import { KabarListHeader } from '@/app/(public)/_com/kabar-list/KabarListHeader';
import { listSearchable, parsePage } from '@/app/(public)/_com/kabar-list/kabar-list.logic';
import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';
import { useTransitionRouter } from 'next-view-transitions';
import { useSearchParams } from 'next/navigation';
import { KolaborasiList } from './KolaborasiList';
import { kolaborasiListHref, parseTahun, tahunTabs, type KolaborasiQuery } from './kolaborasi.logic';
import { KOLABORASI_TEXT as T } from './kolaborasi.text';
import { loadKolaborasi, loadMitra } from './kolaborasi.source';
import { MitraWall } from './MitraWall';
import { useLoadOnce } from '@/app/(public)/_com/load-once/use-load-once';

/**
 * Halaman Kolaborasi Inovasi di `.section` Kabar Desa: kepala (kembali, judul, cari `?search=` bila > 6 entri atau sedang
 * mencari, pil `?tahun=` bila ≥ 2 tahun), daftar baris per tahun (paginasi klien `?page=`), lalu dinding logo mitra.
 */
export function KolaborasiPage() {
  const router = useTransitionRouter();
  const searchParams = useSearchParams();
  const query: KolaborasiQuery = {
    tahun: parseTahun(searchParams.get('tahun')),
    search: searchParams.get('search')?.trim() ?? '',
    page: parsePage(searchParams.get('page')),
  };
  const kolaborasi = useLoadOnce(loadKolaborasi, 'kolaborasi inovasi (Kolaborasi Inovasi)');
  const mitra = useLoadOnce(loadMitra, 'mitra kolaborasi (Kolaborasi Inovasi)');
  const all = kolaborasi.status === 'ready' ? kolaborasi.data : null;

  return (
    <div className={kabar.section}>
      <KabarListHeader
        title={T.title}
        lead={T.lead}
        searchLabel={T.searchLabel}
        searchPlaceholder={T.searchPlaceholder}
        kategoriLabel={T.kategoriLabel}
        tabs={all ? tahunTabs(all, query) : []}
        search={query.search}
        onSearch={(next) => router.replace(kolaborasiListHref({ tahun: query.tahun, search: next }))}
        searchable={listSearchable(query.search, all?.length ?? null)}
      />
      <KolaborasiList
        state={kolaborasi}
        query={query}
        onPage={(page) => router.push(kolaborasiListHref({ tahun: query.tahun, search: query.search, page }))}
      />
      <MitraWall state={mitra} />
    </div>
  );
}
