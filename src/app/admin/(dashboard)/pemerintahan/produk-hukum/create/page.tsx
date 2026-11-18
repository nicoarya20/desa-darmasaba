'use client'
import stateProdukHukum from '@/app/admin/(dashboard)/_state/desa/produkHukum';
import colors from '@/con/colors';
import { Box, Button } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useSnapshot } from 'valtio';
import ProdukHukumForm from '../_com/ProdukHukumForm';
import { PRODUK_HUKUM_ADMIN_PATH } from '../_com/produk-hukum.meta';
import { PRODUK_HUKUM_ADMIN_TEXT as T } from '../_com/produk-hukum.text';

/** Admin: tambah produk hukum baru (PDF opsional). */
export default function CreateProdukHukum() {
  const router = useRouter();
  const { loading } = useSnapshot(stateProdukHukum.create);

  useShallowEffect(() => {
    stateProdukHukum.create.reset();
  }, []);

  const handleSubmit = async (pdf: File | null) => {
    if (await stateProdukHukum.create.submit(pdf)) router.push(PRODUK_HUKUM_ADMIN_PATH);
  };

  return (
    <Box px={{ base: 0, md: 'xs' }} py="xs">
      <Button
        variant="subtle"
        onClick={() => router.push(PRODUK_HUKUM_ADMIN_PATH)}
        leftSection={<IconArrowBack size={24} color={colors['blue-button']} />}
        mb={15}
      >
        {T.back}
      </Button>
      <ProdukHukumForm
        form={stateProdukHukum.create.form}
        loading={loading}
        submitLabel={T.submitCreate}
        onSubmit={handleSubmit}
      />
    </Box>
  );
}
