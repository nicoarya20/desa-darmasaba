'use client';

import infoSekolahPaud from '@/app/admin/(dashboard)/_state/pendidikan/info-sekolah-paud';
import { formDariDetail } from '@/app/admin/(dashboard)/_state/pendidikan/infoSekolahPaud/lembaga.form';
import { Alert, Skeleton, Stack } from '@mantine/core';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useSnapshot } from 'valtio';
import LembagaAnakAdmin from '../../_com/lembaga.anak-admin';
import LembagaFormPage from '../../_com/lembaga.form-page';

const DAFTAR = '/admin/pendidikan/info-sekolah/lembaga';

/** Halaman admin edit lembaga: form detail sekolah + struktur organisasi + foto kegiatan. */
export default function EditLembaga() {
  const router = useRouter();
  const id = useParams()?.id as string;
  const detail = useSnapshot(infoSekolahPaud.lembagaPendidikan.findUnique);

  useEffect(() => {
    if (id) void infoSekolahPaud.lembagaPendidikan.findUnique.load(id);
  }, [id]);

  const data = infoSekolahPaud.lembagaPendidikan.findUnique.data;
  if (detail.gagal) return <Alert color="red" m="md">Data lembaga tidak ditemukan atau gagal dimuat.</Alert>;
  if (detail.loading || !data || data.id !== id) {
    return (
      <Stack p="md">
        <Skeleton h={500} radius="md" />
      </Stack>
    );
  }

  return (
    <LembagaFormPage key={id} judul="Edit Lembaga Pendidikan" awal={formDariDetail(data)} id={id} onSaved={() => router.push(DAFTAR)}>
      <LembagaAnakAdmin lembagaId={id} />
    </LembagaFormPage>
  );
}
