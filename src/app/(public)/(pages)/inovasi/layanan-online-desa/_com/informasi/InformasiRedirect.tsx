'use client';
import { KABAR_BRAND_VARS } from '@/app/(public)/_com/main-page/kabar-desa/kabar.meta';
import r from '@/app/(public)/_com/link-reveal/link-reveal.module.css';
import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';
import { Link } from 'next-view-transitions';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { informasiListHref, informasiRedirectHref, type InformasiKind, type InformasiLookup } from './informasi-redirect.logic';
import { lookupInformasi } from './informasi-redirect.source';
import s from './informasi-redirect.module.css';

const TEXT: Record<InformasiKind, { opening: string; list: string }> = {
  berita: { opening: 'Membuka berita…', list: 'Lihat semua berita' },
  pengumuman: { opening: 'Membuka pengumuman…', list: 'Lihat semua pengumuman' },
};

/** Detail lama Informasi Desa: periksa item lalu `replace` ke URL detail kanonik (tidak menambah riwayat). */
export function InformasiRedirect({ kind, id }: { kind: InformasiKind; id: string }) {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    lookupInformasi(kind, id)
      .catch((error: unknown): InformasiLookup => {
        console.error(`Gagal memeriksa ${kind} ${id} untuk pengalihan, pakai URL detail tanpa kategori:`, error);
        return { status: 'error' };
      })
      .then((lookup) => {
        if (!cancelled) router.replace(informasiRedirectHref(kind, id, lookup));
      });
    return () => {
      cancelled = true;
    };
  }, [kind, id, router]);

  return <InformasiRedirectNotice kind={kind} />;
}

/** Keadaan memuat singkat selama pengalihan + tautan cadangan ke daftar (diekspor untuk test). */
export function InformasiRedirectNotice({ kind }: { kind: InformasiKind }) {
  const text = TEXT[kind];
  return (
    <div className={kabar.section} style={KABAR_BRAND_VARS}>
      <div className={s.notice} role="status" aria-busy="true">
        <p className={s.opening}>{text.opening}</p>
        <Link href={informasiListHref(kind)} className={`${s.link} ${r.trigger}`}>
          <span className={r.cta} data-text={text.list}>
            {text.list}
          </span>
          <span className={r.chevron} aria-hidden>
            ›
          </span>
        </Link>
      </div>
    </div>
  );
}
