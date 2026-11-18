'use client'
import stateProdukHukum from '@/app/admin/(dashboard)/_state/desa/produkHukum';
import colors from '@/con/colors';
import { Box, Button, Skeleton } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useSnapshot } from 'valtio';
import ProdukHukumForm from '../../_com/ProdukHukumForm';
import { PRODUK_HUKUM_ADMIN_PATH } from '../../_com/produk-hukum.meta';
import { PRODUK_HUKUM_ADMIN_TEXT as T } from '../../_com/produk-hukum.text';

/** Admin: ubah produk hukum; PDF lama dipertahankan bila tidak memilih berkas baru. */
export default function EditProdukHukum() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const snap = useSnapshot(stateProdukHukum.edit);

  useShallowEffect(() => {
    void stateProdukHukum.edit.load(id).then((found) => {
      if (!found) router.push(PRODUK_HUKUM_ADMIN_PATH);
    });
  }, [id]);

  const handleSubmit = async (pdf: File | null) => {
    if (await stateProdukHukum.edit.submit(pdf)) router.push(PRODUK_HUKUM_ADMIN_PATH);
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
      {snap.id !== id ? (
        <Skeleton height={420} radius="md" />
      ) : (
        <ProdukHukumForm
          form={stateProdukHukum.edit.form}
          loading={snap.loading}
          submitLabel={T.submitEdit}
          currentFile={snap.currentFile}
          onSubmit={handleSubmit}
        />
      )}
    </Box>
  );
}
