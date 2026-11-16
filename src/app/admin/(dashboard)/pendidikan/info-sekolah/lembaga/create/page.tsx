'use client';

import { FORM_LEMBAGA_KOSONG } from '@/app/admin/(dashboard)/_state/pendidikan/infoSekolahPaud/lembaga.form';
import { Alert } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import LembagaFormPage from '../_com/lembaga.form-page';

/** Halaman admin tambah lembaga; setelah tersimpan lanjut ke edit untuk mengisi struktur & foto kegiatan. */
function CreateLembaga() {
  const router = useRouter();
  return (
    <LembagaFormPage
      judul="Tambah Lembaga Pendidikan"
      awal={FORM_LEMBAGA_KOSONG}
      id={null}
      onSaved={(id) => router.push(`/admin/pendidikan/info-sekolah/lembaga/${id}/edit`)}
    >
      <Alert color="blue" icon={<IconInfoCircle size={18} />} mt="lg" w={{ base: '100%', md: '70%' }}>
        Struktur organisasi dan foto kegiatan bisa ditambahkan setelah data lembaga disimpan.
      </Alert>
    </LembagaFormPage>
  );
}

export default CreateLembaga;
