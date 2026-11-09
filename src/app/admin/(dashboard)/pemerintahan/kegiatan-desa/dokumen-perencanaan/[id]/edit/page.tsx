'use client'
import stateDokumenPerencanaan, { uploadDokumenPdf } from '@/app/admin/(dashboard)/_state/desa/dokumenPerencanaan';
import colors from '@/con/colors';
import { Box, Button, Skeleton } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import DokumenPerencanaanForm from '../../_com/DokumenPerencanaanForm';

const LIST_PATH = '/admin/pemerintahan/kegiatan-desa/dokumen-perencanaan';

/** Admin: ubah dokumen perencanaan; PDF lama dipertahankan bila tidak memilih berkas baru. */
export default function EditDokumenPerencanaan() {
  const state = useProxy(stateDokumenPerencanaan);
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  useShallowEffect(() => {
    stateDokumenPerencanaan.edit.load(id);
  }, [id]);

  const handleSubmit = async (pdf: File | null) => {
    const edit = stateDokumenPerencanaan.edit;
    if (pdf) {
      const fileId = await uploadDokumenPdf(pdf);
      if (!fileId) return;
      edit.form.fileId = fileId;
    }
    if (await edit.submit()) router.push(LIST_PATH);
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
      {state.edit.id !== id ? (
        <Skeleton height={500} radius="md" />
      ) : (
        <DokumenPerencanaanForm
          form={state.edit.form}
          loading={state.edit.loading}
          submitLabel="Simpan Perubahan"
          currentFile={state.edit.currentFile}
          onSubmit={handleSubmit}
        />
      )}
    </Box>
  );
}
