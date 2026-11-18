'use client';
import BackButton from '@/app/(public)/(pages)/pemerintahan/layanan/_com/BackButto';
import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';
import pustuState from '@/app/admin/(dashboard)/_state/kesehatan/puskesmas/pustu.state';
import type { PustuRingkas } from '@/lib/pustu/pustu.types';
import { Center, Image, Pagination, Skeleton, TextInput } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconSearch } from '@tabler/icons-react';
import { Link } from 'next-view-transitions';
import { useEffect, useState } from 'react';
import { useSnapshot } from 'valtio';
import { PUSTU_TEXT as T } from './pustu.text';
import s from './pustu.module.css';

/** Jumlah kartu PUSTU per halaman daftar publik. */
const PUSTU_PAGE_LIMIT = 6;

/** Kartu ringkas PUSTU di daftar: foto, nama, alamat, jam operasional, telepon, tautan detail. */
export function PustuCard({ item }: { item: PustuRingkas }) {
  const telepon = item.kontak?.kontakPuskesmas?.trim();
  return (
    <li className={s.card}>
      {item.image?.link ? <Image src={item.image.link} alt={item.name} className={s.listPhoto} loading="lazy" /> : null}
      <h2 className={s.cardTitle}>{item.name}</h2>
      <p className={s.cardText}>{item.alamat}</p>
      {item.jadwal.length > 0 ? (
        <ul className={s.jadwalList} aria-label={T.jam}>
          {item.jadwal.map((j, i) => (
            <li key={i} className={s.cardText}>
              {j.hari}: {j.jam}
            </li>
          ))}
        </ul>
      ) : null}
      {telepon ? <p className={s.cardText}>{`${T.telepon}: ${telepon}`}</p> : null}
      <Link href={`/kesehatan/puskesmas/${encodeURIComponent(item.id)}`} className={s.listLink}>
        {T.lihatDetail} →
      </Link>
    </li>
  );
}

/** Halaman publik daftar PUSTU (Puskesmas Pembantu): judul, pencarian, kartu berpaginasi. */
export default function PustuListPage() {
  const snap = useSnapshot(pustuState.findMany);
  const [search, setSearch] = useState('');
  const [cari] = useDebouncedValue(search, 600);

  useEffect(() => {
    void pustuState.findMany.load(1, PUSTU_PAGE_LIMIT, cari);
  }, [cari]);

  const data = pustuState.findMany.data;
  return (
    <section className={kabar.section}>
      <div className={s.block}>
        <BackButton />
        <header className={s.listHead}>
          <h1 className={s.listTitle}>{T.judul}</h1>
          <p className={s.listLead}>{T.pengantar}</p>
          <TextInput
            radius="xl"
            maw={420}
            placeholder={T.cariPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            leftSection={<IconSearch size={18} />}
            aria-label={T.cariLabel}
          />
        </header>
        {snap.loading || !data ? (
          <Skeleton h={320} radius="lg" aria-label={T.memuat} />
        ) : data.length === 0 ? (
          <p className={kabar.empty}>{cari ? T.kosongCari : T.kosong}</p>
        ) : (
          <ul className={s.cardGrid}>
            {data.map((item) => (
              <PustuCard key={item.id} item={item} />
            ))}
          </ul>
        )}
        {snap.totalPages > 1 ? (
          <Center>
            <Pagination
              value={snap.page}
              onChange={(p) => void pustuState.findMany.load(p, PUSTU_PAGE_LIMIT, cari)}
              total={snap.totalPages}
              radius="xl"
            />
          </Center>
        ) : null}
      </div>
    </section>
  );
}
