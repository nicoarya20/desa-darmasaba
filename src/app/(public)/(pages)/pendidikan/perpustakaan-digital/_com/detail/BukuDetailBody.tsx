'use client';
import r from '@/app/(public)/_com/link-reveal/link-reveal.module.css';
import { IconBook2 } from '@tabler/icons-react';
import { Link } from 'next-view-transitions';
import { useState } from 'react';
import ModalPeminjaman from '../../_lib/modalPeminjaman';
import { LAMA_PINJAM_HARI } from '../../_lib/peminjamanForm';
import { BukuSampul } from '../BukuSampul';
import { perpusListHref } from '../perpus-katalog.logic';
import { BUKU_DETAIL_TEXT as T } from '../perpus.text';
import type { Buku } from '../perpus.types';
import s from './buku-detail.module.css';
import { BukuLainnya } from './BukuLainnya';

/** Isi detail buku yang sudah dimuat: sampul | info + tombol pinjam (membuka modal), lalu rel buku lain. */
export function BukuDetailBody({ buku }: { buku: Buku }) {
  const [pinjamOpen, setPinjamOpen] = useState(false);

  return (
    <>
      <article className={s.grid}>
        <div className={s.cover}>
          <BukuSampul src={buku.sampul} alt={buku.judul} iconSize={64} />
        </div>
        <div className={s.info}>
          {buku.kategori && (
            <Link href={perpusListHref(buku.kategori.slug)} className={`${s.kategori} ${r.trigger}`}>
              <span className={r.cta} data-text={buku.kategori.nama}>
                {buku.kategori.nama}
              </span>
            </Link>
          )}
          <h1 className={s.title}>{buku.judul}</h1>
          <section className={s.deskripsi} aria-labelledby="buku-deskripsi">
            <h2 id="buku-deskripsi" className={s.srOnly}>
              {T.deskripsi}
            </h2>
            {buku.deskripsiHtml ? (
              <div className={s.prose} dangerouslySetInnerHTML={{ __html: buku.deskripsiHtml }} />
            ) : (
              <p className={s.muted}>{T.deskripsiKosong}</p>
            )}
          </section>
          <button type="button" className={s.cta} onClick={() => setPinjamOpen(true)}>
            <IconBook2 size={20} stroke={1.75} aria-hidden="true" />
            {T.pinjam}
          </button>
          <section className={s.panel} aria-labelledby="cara-meminjam">
            <h2 id="cara-meminjam" className={s.panelTitle}>
              {T.caraTitle}
            </h2>
            <ol className={s.steps}>
              {T.caraLangkah(LAMA_PINJAM_HARI).map((langkah) => (
                <li key={langkah}>{langkah}</li>
              ))}
            </ol>
          </section>
        </div>
      </article>
      <BukuLainnya current={buku} />
      <ModalPeminjaman
        opened={pinjamOpen}
        onClose={() => setPinjamOpen(false)}
        buku={{ id: buku.id, judul: buku.judul, sampul: buku.sampul, kategoriNama: buku.kategori?.nama ?? null }}
      />
    </>
  );
}
