'use client';
import { KabarListHeader } from '@/app/(public)/_com/kabar-list/KabarListHeader';
import { KabarListPagination } from '@/app/(public)/_com/kabar-list/KabarListPagination';
import r from '@/app/(public)/_com/link-reveal/link-reveal.module.css';
import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';
import { responsiveImageProps } from '@/app/(public)/_com/responsive-image.logic';
import pustuState from '@/app/admin/(dashboard)/_state/kesehatan/puskesmas/pustu.state';
import type { PustuRingkas } from '@/lib/pustu/pustu.types';
import { Image } from '@mantine/core';
import { IconBuildingHospital, IconChevronRight } from '@tabler/icons-react';
import { Link } from 'next-view-transitions';
import { useEffect, useState } from 'react';
import { useSnapshot } from 'valtio';
import { PUSTU_TEXT as T } from './pustu.text';
import s from './pustu.module.css';

/** Jumlah kartu PUSTU per halaman daftar publik (3 kolom × 2 baris di desktop). */
const PUSTU_PAGE_LIMIT = 6;

/** `sizes` foto kartu = kartu kecil grid Kabar (`.rail.railGrid`: 1/2/3 kolom). */
const PHOTO_SIZES = '(max-width: 734px) 111vw, (max-width: 1068px) 56vw, 38vw';

/** Foto lokasi (dekoratif: judul kartu sudah menamai isinya); tanpa foto → ikon pengganti. */
function PustuPhoto({ url }: { url?: string | null }) {
  if (!url) {
    return (
      <span className={kabar.photoFallback} aria-hidden>
        <IconBuildingHospital size={40} stroke={1.25} />
      </span>
    );
  }
  return <Image alt="" className={kabar.photoImg} {...responsiveImageProps(url, PHOTO_SIZES)} loading="lazy" decoding="async" />;
}

/** Kartu ringkas PUSTU gaya kartu kecil Kabar: seluruh kartu = tautan detail; foto, nama, alamat, jam, telepon, "Lihat detail". */
export function PustuCard({ item }: { item: PustuRingkas }) {
  const telepon = item.kontak?.kontakPuskesmas?.trim();
  return (
    <li>
      <Link href={`/kesehatan/puskesmas/${encodeURIComponent(item.id)}`} className={`${kabar.card} ${r.trigger}`}>
        <span className={kabar.cardPhoto}>
          <PustuPhoto url={item.image?.link} />
        </span>
        <span className={kabar.cardBody}>
          <h2 className={kabar.cardTitle}>
            <span className={r.title}>{item.name}</span>
          </h2>
          <span className={s.cardText}>{item.alamat}</span>
          {item.jadwal.length > 0 ? (
            <ul className={s.jadwalList} aria-label={T.jam}>
              {item.jadwal.map((j, i) => (
                <li key={i} className={s.cardText}>
                  {j.hari}: {j.jam}
                </li>
              ))}
            </ul>
          ) : null}
          {telepon ? <span className={s.cardText}>{`${T.telepon}: ${telepon}`}</span> : null}
          <span className={s.cardCta}>
            <span className={r.cta} data-text={T.lihatDetail}>
              {T.lihatDetail}
            </span>
            <IconChevronRight className={r.chevron} size={16} stroke={2} aria-hidden />
          </span>
        </span>
      </Link>
    </li>
  );
}

/** Halaman publik daftar PUSTU (Puskesmas Pembantu): kepala Kabar (kembali, judul, cari), kartu berpaginasi. */
export default function PustuListPage() {
  const snap = useSnapshot(pustuState.findMany);
  const [cari, setCari] = useState('');

  useEffect(() => {
    void pustuState.findMany.load(1, PUSTU_PAGE_LIMIT, cari);
  }, [cari]);

  const data = pustuState.findMany.data;
  const memuat = snap.loading || !data;
  return (
    <section className={kabar.section}>
      <KabarListHeader
        title={T.judul}
        lead={T.pengantar}
        searchLabel={T.cariLabel}
        searchPlaceholder={T.cariPlaceholder}
        kategoriLabel={T.daftarLabel}
        tabs={[]}
        search={cari}
        onSearch={setCari}
      />
      {memuat ? (
        <ul className={`${kabar.rail} ${kabar.railGrid}`} aria-busy="true" aria-label={T.memuat}>
          {Array.from({ length: PUSTU_PAGE_LIMIT }, (_, i) => (
            <li key={i} className={`${kabar.card} ${kabar.placeholder}`} aria-hidden />
          ))}
        </ul>
      ) : data.length === 0 ? (
        <p className={kabar.empty}>{cari ? T.kosongCari : T.kosong}</p>
      ) : (
        <ul className={`${kabar.rail} ${kabar.railGrid}`} aria-label={T.daftarLabel}>
          {data.map((item) => (
            <PustuCard key={item.id} item={item} />
          ))}
        </ul>
      )}
      <KabarListPagination
        total={snap.totalPages}
        value={snap.page}
        label={T.paginasiLabel}
        onChange={(p) => void pustuState.findMany.load(p, PUSTU_PAGE_LIMIT, cari)}
      />
    </section>
  );
}
