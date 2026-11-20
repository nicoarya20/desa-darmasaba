'use client'
import stateLembagaKomunitas from '@/app/admin/(dashboard)/_state/desa/lembagaKomunitas';
import colors from '@/con/colors';
import { LEMBAGA_KOMUNITAS_ADMIN_PATH } from '@/lib/lembaga-komunitas';
import { Box, Button } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useSnapshot } from 'valtio';
import LembagaKomunitasForm from '../_com/LembagaKomunitasForm';
import { LEMBAGA_KOMUNITAS_ADMIN_TEXT as T } from '../_com/lembaga-komunitas.text';

/** Admin: tambah lembaga atau komunitas baru (foto opsional). */
export default function CreateLembagaKomunitas() {
  const router = useRouter();
  const { create, jenis } = useSnapshot(stateLembagaKomunitas);

  useShallowEffect(() => {
    stateLembagaKomunitas.create.reset();
    void stateLembagaKomunitas.jenis.load();
  }, []);

  return (
    <Box px={{ base: 0, md: 'xs' }} py="xs">
      <Button
        variant="subtle"
        onClick={() => router.push(LEMBAGA_KOMUNITAS_ADMIN_PATH)}
        leftSection={<IconArrowBack size={24} color={colors['blue-button']} />}
        mb={15}
      >
        {T.back}
      </Button>
      <LembagaKomunitasForm
        form={stateLembagaKomunitas.create.form}
        loading={create.loading}
        submitLabel={T.submitCreate}
        jenisOptions={jenis.data}
        onSubmit={async (foto) => {
          if (await stateLembagaKomunitas.create.submit(foto)) router.push(LEMBAGA_KOMUNITAS_ADMIN_PATH);
        }}
      />
    </Box>
  );
}
