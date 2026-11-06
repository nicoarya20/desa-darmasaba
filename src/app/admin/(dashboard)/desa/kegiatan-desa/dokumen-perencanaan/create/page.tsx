'use client'
import stateDokumenPerencanaan, { uploadDokumenPdf } from '@/app/admin/(dashboard)/_state/desa/dokumenPerencanaan';
import colors from '@/con/colors';
import { Box, Button } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import DokumenPerencanaanForm from '../_com/DokumenPerencanaanForm';

const LIST_PATH = '/admin/desa/kegiatan-desa/dokumen-perencanaan';

/** Admin: tambah dokumen perencanaan baru. */
export default function CreateDokumenPerencanaan() {
  const state = useProxy(stateDokumenPerencanaan);
  const router = useRouter();

  useShallowEffect(() => {
    stateDokumenPerencanaan.create.reset();
  }, []);

  const handleSubmit = async (pdf: File | null) => {
    const create = stateDokumenPerencanaan.create;
    if (pdf) {
      const fileId = await uploadDokumenPdf(pdf);
      if (!fileId) return;
      create.form.fileId = fileId;
    }
    if (await create.submit()) router.push(LIST_PATH);
  };

  return (
    <Box px={{ base: 0, md: 'xs' }} py="xs">
      <Button
        variant="subtle"
        onClick={() => router.push(LIST_PATH)}
        leftSection={<IconArrowBack size={24} color={colors['blue-button']} />}
        mb={15}
      >
        Kembali
      </Button>
      <DokumenPerencanaanForm
        form={state.create.form}
        loading={state.create.loading}
        submitLabel="Simpan"
        onSubmit={handleSubmit}
      />
    </Box>
  );
}
