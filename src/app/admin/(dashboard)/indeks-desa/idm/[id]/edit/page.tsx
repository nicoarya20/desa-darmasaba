'use client'
import stateIndeksDesa from '@/app/admin/(dashboard)/_state/indeks-desa/indeksDesa';
import colors from '@/con/colors';
import { INDEKS_DESA_ADMIN_PATH } from '@/lib/indeks-desa';
import { Box, Button, Skeleton } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useSnapshot } from 'valtio';
import IndeksDesaForm from '../../_com/IndeksDesaForm';
import { INDEKS_DESA_ADMIN_TEXT as T } from '../../_com/indeks-desa.text';

/** Admin: ubah data Indeks Desa satu tahun. */
export default function EditIndeksDesa() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const snap = useSnapshot(stateIndeksDesa.edit);

  useShallowEffect(() => {
    void stateIndeksDesa.edit.load(id).then((found) => {
      if (!found) router.push(INDEKS_DESA_ADMIN_PATH);
    });
  }, [id]);

  const handleSubmit = async () => {
    if (await stateIndeksDesa.edit.submit()) router.push(INDEKS_DESA_ADMIN_PATH);
  };

  return (
    <Box px={{ base: 0, md: 'xs' }} py="xs">
      <Button
        variant="subtle"
        onClick={() => router.push(INDEKS_DESA_ADMIN_PATH)}
        leftSection={<IconArrowBack size={24} color={colors['blue-button']} />}
        mb={15}
      >
        {T.back}
      </Button>
      {snap.id !== id ? (
        <Skeleton height={420} radius="md" />
      ) : (
        <IndeksDesaForm
          form={stateIndeksDesa.edit.form}
          loading={snap.loading}
          submitLabel={T.submitEdit}
          onSubmit={handleSubmit}
        />
      )}
    </Box>
  );
}
