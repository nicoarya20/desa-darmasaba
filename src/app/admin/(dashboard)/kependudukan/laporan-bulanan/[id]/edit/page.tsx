'use client'
import laporanBulanan from '@/app/admin/(dashboard)/_state/kependudukan/laporan-bulanan';
import colors from '@/con/colors';
import { Box, Button, Group, Skeleton, Title } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import LaporanBulananForm from '../../_com/LaporanBulananForm';

const LIST_PATH = '/admin/kependudukan/laporan-bulanan';

/** Admin: ubah laporan penduduk bulanan. */
export default function EditLaporanBulanan() {
  // sync: cegah caret loncat di input terkontrol yang terikat state Valtio.
  const state = useProxy(laporanBulanan, { sync: true });
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  useShallowEffect(() => {
    laporanBulanan.edit.load(id);
    laporanBulanan.banjarOptions.load();
  }, [id]);

  const handleSubmit = async () => {
    if (await laporanBulanan.edit.submit()) router.push(LIST_PATH);
  };

  return (
    <Box px={{ base: 0, md: 'xs' }} py="xs">
      <Group mb="md">
        <Button variant="subtle" onClick={() => router.push(LIST_PATH)} p="xs" radius="md" aria-label="Kembali">
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
        <Title order={4} ml="sm" c="dark">Edit Laporan Bulanan</Title>
      </Group>
      {state.edit.id !== id ? (
        <Skeleton height={420} radius="md" />
      ) : (
        <LaporanBulananForm
          form={state.edit.form}
          loading={state.edit.loading}
          submitLabel="Simpan Perubahan"
          banjarOptions={state.banjarOptions.data}
          onSubmit={handleSubmit}
        />
      )}
    </Box>
  );
}
