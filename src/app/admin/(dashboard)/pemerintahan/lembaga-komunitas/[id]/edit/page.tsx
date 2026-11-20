'use client'
import stateLembagaKomunitas from '@/app/admin/(dashboard)/_state/desa/lembagaKomunitas';
import colors from '@/con/colors';
import { LEMBAGA_KOMUNITAS_ADMIN_PATH } from '@/lib/lembaga-komunitas';
import { Box, Button, Skeleton } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useSnapshot } from 'valtio';
import LembagaKomunitasForm from '../../_com/LembagaKomunitasForm';
import { LEMBAGA_KOMUNITAS_ADMIN_TEXT as T } from '../../_com/lembaga-komunitas.text';

/** Admin: ubah lembaga atau komunitas; foto lama dipertahankan bila tidak memilih foto baru atau melepasnya. */
export default function EditLembagaKomunitas() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { edit, jenis } = useSnapshot(stateLembagaKomunitas);

  useShallowEffect(() => {
    void stateLembagaKomunitas.jenis.load();
    void stateLembagaKomunitas.edit.load(id).then((found) => {
      if (!found) router.push(LEMBAGA_KOMUNITAS_ADMIN_PATH);
    });
  }, [id]);

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
      {edit.id !== id ? (
        <Skeleton height={520} radius="md" />
      ) : (
        <LembagaKomunitasForm
          form={stateLembagaKomunitas.edit.form}
          loading={edit.loading}
          submitLabel={T.submitEdit}
          currentFoto={edit.currentFoto}
          jenisOptions={jenis.data}
          onSubmit={async (foto) => {
            if (await stateLembagaKomunitas.edit.submit(foto)) router.push(LEMBAGA_KOMUNITAS_ADMIN_PATH);
          }}
        />
      )}
    </Box>
  );
}
