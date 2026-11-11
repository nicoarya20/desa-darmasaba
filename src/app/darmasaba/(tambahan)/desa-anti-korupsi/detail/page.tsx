'use client';
import korupsiState from '@/app/admin/(dashboard)/_state/landing-page/desa-anti-korupsi';
import { toSentenceCase } from '@/app/darmasaba/_com/main-page/desaantikorupsi/desaantikorupsi.logic';
import { ANTIKORUPSI_BRAND_VARS } from '@/app/darmasaba/_com/main-page/desaantikorupsi/desaantikorupsi.meta';
import BackButton from '@/app/darmasaba/(pages)/pemerintahan/layanan/_com/BackButto';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSnapshot } from 'valtio';
import { detailHref, filterByKategori, resolveInitialKategori } from '../_lib/kategori-tab';
import { AntiKorupsiDokumenList, AntiKorupsiDokumenSkeleton } from '../_com/AntiKorupsiDokumenList';
import { AntiKorupsiKategoriPills } from '../_com/AntiKorupsiKategoriPills';
import {
  countByKategori,
  countDokumen,
  kategoriNames,
  toDokumenRows,
  type AntiKorupsiDetailApiItem,
} from '../_com/antikorupsi-detail.logic';
import s from '../_com/antikorupsi-detail.module.css';
import { AK_DETAIL_TEXT } from '../_com/antikorupsi-detail.text';

/** Semua indikator dimuat sekaligus (data desa ±18 butir); saring per kategori di klien. */
const DETAIL_LIST_LIMIT = 100;
const TITLE_ID = 'desa-anti-korupsi-detail-title';
const LIST_TITLE_ID = 'desa-anti-korupsi-detail-kategori';

function AntiKorupsiDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data } = useSnapshot(korupsiState.desaAntikorupsi.findMany);
  const [pickedKategori, setPickedKategori] = useState<string | null>(null);
  // true sejak render pertama: store bisa berisi 10 butir sisa beranda sebelum muatan 100 butir selesai.
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    // load() menangani galatnya sendiri (data dikosongkan + console.error di state store).
    void korupsiState.desaAntikorupsi.findMany.load(1, DETAIL_LIST_LIMIT).finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const items = data as readonly AntiKorupsiDetailApiItem[];
  const categories = useMemo(() => kategoriNames(items), [items]);
  const counts = useMemo(() => countByKategori(items), [items]);
  const selectedKategori = pickedKategori ?? resolveInitialKategori(searchParams.get('kategori'), categories);
  const rows = useMemo(() => toDokumenRows(filterByKategori(items, selectedKategori)), [items, selectedKategori]);

  const selectKategori = (kategori: string) => {
    setPickedKategori(kategori);
    router.replace(detailHref(kategori), { scroll: false });
  };

  return (
    <div className={s.page} style={ANTIKORUPSI_BRAND_VARS}>
      <div className={s.inner}>
        <BackButton />

        <header className={s.header}>
          <h1 id={TITLE_ID} className={s.title}>
            {AK_DETAIL_TEXT.title}
          </h1>
          <p className={s.lead}>{AK_DETAIL_TEXT.lead}</p>
        </header>

        <div aria-busy={loading || undefined}>
          {loading ? (
            <>
              <span className={s.srOnly}>{AK_DETAIL_TEXT.loading}</span>
              <div className={s.listPlaceholder}>
                <AntiKorupsiDokumenSkeleton />
              </div>
            </>
          ) : categories.length === 0 ? (
            <p className={s.empty}>{AK_DETAIL_TEXT.empty}</p>
          ) : (
            <>
              <AntiKorupsiKategoriPills
                categories={categories}
                counts={counts}
                selected={selectedKategori}
                onSelect={selectKategori}
              />
              <div className={s.listHead}>
                <h2 id={LIST_TITLE_ID} className={s.listTitle}>
                  {toSentenceCase(selectedKategori)}
                </h2>
                <p className={s.summary}>{AK_DETAIL_TEXT.summary(countDokumen(rows), rows.length)}</p>
              </div>
              {rows.length === 0 ? (
                <p className={s.empty}>{AK_DETAIL_TEXT.emptyKategori}</p>
              ) : (
                <AntiKorupsiDokumenList rows={rows} labelledBy={LIST_TITLE_ID} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// useSearchParams di client page wajib dalam Suspense boundary agar `next build` tidak gagal.
function AntiKorupsiDetailPage() {
  return (
    <Suspense
      fallback={
        <div className={s.page}>
          <div className={s.inner}>
            <AntiKorupsiDokumenSkeleton />
          </div>
        </div>
      }
    >
      <AntiKorupsiDetailContent />
    </Suspense>
  );
}

export default AntiKorupsiDetailPage;
