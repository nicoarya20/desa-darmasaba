'use client';

import { FORM_BANK_SAMPAH_KOSONG } from '@/app/admin/(dashboard)/_state/lingkungan/bank-sampah/bank-sampah.form';
import { Alert } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import BankSampahFormPage from '../_com/bank-sampah.form-page';

/** Halaman admin tambah bank sampah; setelah tersimpan lanjut ke edit untuk mengisi pengurus & dokumentasi. */
function CreateKeteranganBankSampahTerdekat() {
  const router = useRouter();
  return (
    <BankSampahFormPage
      judul="Tambah Bank Sampah Terdekat"
      awal={FORM_BANK_SAMPAH_KOSONG}
      id={null}
      onSaved={(id) => router.push(`/admin/lingkungan/pengelolaan-sampah-bank-sampah/keterangan-bank-sampah-terdekat/${id}/edit`)}
    >
      <Alert color="blue" icon={<IconInfoCircle size={18} />} mt="lg" w={{ base: '100%', md: '70%' }}>
        Struktur pengurus dan dokumentasi kegiatan bisa ditambahkan setelah data bank sampah disimpan.
      </Alert>
    </BankSampahFormPage>
  );
}

export default CreateKeteranganBankSampahTerdekat;
