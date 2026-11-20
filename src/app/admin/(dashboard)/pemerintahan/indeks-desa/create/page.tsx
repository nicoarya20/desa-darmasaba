'use client'
import stateIndeksDesa from '@/app/admin/(dashboard)/_state/desa/indeksDesa';
import colors from '@/con/colors';
import { INDEKS_DESA_ADMIN_PATH } from '@/lib/indeks-desa';
import { Box, Button } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useSnapshot } from 'valtio';
import IndeksDesaForm from '../_com/IndeksDesaForm';
import { INDEKS_DESA_ADMIN_TEXT as T } from '../_com/indeks-desa.text';

/** Admin: tambah data Indeks Desa untuk satu tahun. */
export default function CreateIndeksDesa() {
  const router = useRouter();
  const { loading } = useSnapshot(stateIndeksDesa.create);

  useShallowEffect(() => {
    stateIndeksDesa.create.reset();
  }, []);

  const handleSubmit = async () => {
    if (await stateIndeksDesa.create.submit()) router.push(INDEKS_DESA_ADMIN_PATH);
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
      <IndeksDesaForm
        form={stateIndeksDesa.create.form}
        loading={loading}
        submitLabel={T.submitCreate}
        onSubmit={handleSubmit}
      />
    </Box>
  );
}
