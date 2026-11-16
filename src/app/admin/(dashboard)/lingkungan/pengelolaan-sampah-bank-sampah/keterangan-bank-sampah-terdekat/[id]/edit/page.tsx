'use client';

import keteranganSampah from '@/app/admin/(dashboard)/_state/lingkungan/bank-sampah/bank-sampah.state';
import { formDariDetail } from '@/app/admin/(dashboard)/_state/lingkungan/bank-sampah/bank-sampah.form';
import { Alert, Skeleton, Stack } from '@mantine/core';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useSnapshot } from 'valtio';
import BankSampahAnakAdmin from '../../_com/bank-sampah.anak-admin';
import BankSampahFormPage from '../../_com/bank-sampah.form-page';

const DAFTAR = '/admin/lingkungan/pengelolaan-sampah-bank-sampah/keterangan-bank-sampah-terdekat';

/** Halaman admin edit bank sampah: form detail + struktur pengurus + dokumentasi kegiatan. */
function EditKeteranganBankSampahTerdekat() {
  const router = useRouter();
  const id = useParams()?.id as string;
  const detail = useSnapshot(keteranganSampah.findUnique);

  useEffect(() => {
    if (id) void keteranganSampah.findUnique.load(id);
  }, [id]);

  const data = keteranganSampah.findUnique.data;
  if (detail.gagal) return <Alert color="red" m="md">Data bank sampah tidak ditemukan atau gagal dimuat.</Alert>;
  if (detail.loading || !data || data.id !== id) {
    return (
      <Stack p="md">
        <Skeleton h={500} radius="md" />
      </Stack>
    );
  }

  return (
    <BankSampahFormPage
      key={id}
      judul="Edit Bank Sampah Terdekat"
      awal={formDariDetail(data)}
      id={id}
      onSaved={() => router.push(DAFTAR)}
    >
      <BankSampahAnakAdmin bankSampahId={id} />
    </BankSampahFormPage>
  );
}

export default EditKeteranganBankSampahTerdekat;
