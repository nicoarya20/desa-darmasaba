'use client';
import { Skeleton, Stack, Text } from '@mantine/core';
import { useEffect, useState } from 'react';
import s from './struktur-detail.module.css';
import { StrukturDetailFrame, StrukturDetailView, type StrukturDetailBack } from './StrukturDetailView';
import type { StrukturDetailData, StrukturDetailLoader } from './struktur-person.logic';
import { STRUKTUR_DETAIL_TEXT } from './struktur.text';

/** Teks per halaman profil (label baris bersama ada di `STRUKTUR_DETAIL_TEXT`). */
export type StrukturDetailText = { infoTitle: string; notFound: string };

type State =
  | { status: 'loading' }
  | { status: 'ready'; data: StrukturDetailData }
  | { status: 'missing' }
  | { status: 'error' };

type Props = {
  id: string;
  load: StrukturDetailLoader;
  text: StrukturDetailText;
  /** Tautan kembali ke daftar asal profil (mis. Struktur PPID). */
  back: StrukturDetailBack;
};

/**
 * Halaman profil pegawai dari bagan struktur, sumber-agnostik: `load(id)` dari adapter struktur masing-masing
 * (PPID, Perangkat Desa). Memuat → kerangka; `null` → tidak ditemukan; galat → pesan gagal (dicatat).
 */
export function StrukturDetail({ id, load, text, back }: Props) {
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    setState({ status: 'loading' });
    load(id).then(
      (data) => {
        if (active) setState(data ? { status: 'ready', data } : { status: 'missing' });
      },
      (error: unknown) => {
        console.error(`Gagal memuat profil pegawai ${id}:`, error);
        if (active) setState({ status: 'error' });
      },
    );
    return () => {
      active = false;
    };
  }, [id, load]);

  if (state.status === 'ready') return <StrukturDetailView data={state.data} infoTitle={text.infoTitle} back={back} />;
  if (state.status === 'loading') {
    return (
      <Stack py="lg" px={{ base: 'md', md: 100 }} className={s.page} role="status" aria-label={STRUKTUR_DETAIL_TEXT.loading}>
        <Skeleton height={500} radius="md" />
      </Stack>
    );
  }
  return (
    <StrukturDetailFrame back={back}>
      <Text ta="center" c="dimmed" role="status">
        {state.status === 'missing' ? text.notFound : STRUKTUR_DETAIL_TEXT.error}
      </Text>
    </StrukturDetailFrame>
  );
}
