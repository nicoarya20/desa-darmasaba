'use client';

import { FORM_PUSTU_KOSONG } from '@/app/admin/(dashboard)/_state/kesehatan/puskesmas/pustu.form';
import { LABEL_PUSTU_SINGKAT } from '@/lib/pustu/pustu.label';
import { Alert } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import PustuFormPage from '../_com/pustu.form-page';

/** Halaman admin tambah PUSTU; setelah tersimpan lanjut ke edit untuk mengisi struktur & galeri. */
function CreatePuskesmas() {
  const router = useRouter();
  return (
    <PustuFormPage
      judul={`Tambah ${LABEL_PUSTU_SINGKAT}`}
      awal={FORM_PUSTU_KOSONG}
      id={null}
      onSaved={(id) => router.push(`/admin/kesehatan/puskesmas/${id}/edit`)}
    >
      <Alert color="blue" icon={<IconInfoCircle size={18} />} mt="lg" w={{ base: '100%', md: '70%' }}>
        Struktur organisasi dan galeri {LABEL_PUSTU_SINGKAT} bisa ditambahkan setelah data disimpan.
      </Alert>
    </PustuFormPage>
  );
}

export default CreatePuskesmas;
