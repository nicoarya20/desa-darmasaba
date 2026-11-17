'use client';

import r from '@/app/(public)/_com/link-reveal/link-reveal.module.css';
import daftarInformasiPublik from '@/app/admin/(dashboard)/_state/ppid/daftar_informasi_publik/daftarInformasiPublik';
import { Skeleton } from '@mantine/core';
import { IconChevronLeft } from '@tabler/icons-react';
import { Link } from 'next-view-transitions';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import { PpidPage } from '../../_com/PpidPage';
import { DaftarDetail } from '../_com/DaftarDetail';
import { DAFTAR_LIST_HREF } from '../_com/daftar.logic';
import s from '../_com/daftar.module.css';
import { DAFTAR_TEXT } from '../_com/daftar.text';

/** Halaman publik detail satu informasi publik: jenis, tanggal publikasi, dan deskripsi lengkap. */
export default function DetailInformasiPublikUser() {
  const state = useProxy(daftarInformasiPublik);
  const params = useParams();
  const id = typeof params?.id === 'string' ? params.id : '';
  // Id yang pemuatannya sudah selesai; store tidak punya penanda loading untuk findUnique.
  const [loadedId, setLoadedId] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let active = true;
    // load() menangani galatnya sendiri (data → null), jadi cukup menunggu selesai.
    void daftarInformasiPublik.findUnique.load(id).then(() => {
      if (active) setLoadedId(id);
    });
    return () => {
      active = false;
    };
  }, [id]);

  // Store menyimpan detail terakhir yang dibuka: abaikan bila bukan milik id halaman ini.
  const stored = state.findUnique.data;
  const data = stored?.id === id ? stored : null;

  let content;
  if (data) {
    content = <DaftarDetail data={data} />;
  } else if (loadedId === id) {
    content = (
      <div className={s.notFound} role="status">
        <p className={s.notFoundTitle}>{DAFTAR_TEXT.notFound}</p>
        <Link href={DAFTAR_LIST_HREF} className={`${s.detailLink} ${r.trigger}`}>
          <IconChevronLeft className={r.chevronBack} size={16} stroke={2} aria-hidden />
          <span className={r.cta} data-text={DAFTAR_TEXT.backToList}>
            {DAFTAR_TEXT.backToList}
          </span>
        </Link>
      </div>
    );
  } else {
    content = (
      <div className={s.skeleton} role="status" aria-label={DAFTAR_TEXT.detailLoading}>
        <Skeleton h={32} w="60%" radius="md" />
        <Skeleton h={20} w={180} radius="md" />
        <Skeleton h={120} radius="md" />
      </div>
    );
  }

  return (
    <PpidPage title={DAFTAR_TEXT.detailTitle} lead={DAFTAR_TEXT.detailLead}>
      <div className={s.body}>{content}</div>
    </PpidPage>
  );
}
