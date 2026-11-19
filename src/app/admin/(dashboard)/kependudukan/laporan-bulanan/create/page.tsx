'use client'
import laporanBulanan from '@/app/admin/(dashboard)/_state/kependudukan/laporan-bulanan';
import colors from '@/con/colors';
import { Box, Button, Group, Title } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import LaporanBulananForm from '../_com/LaporanBulananForm';

const LIST_PATH = '/admin/kependudukan/laporan-bulanan';

/** Admin: tambah laporan penduduk bulanan satu banjar. */
export default function CreateLaporanBulanan() {
  // sync: cegah caret loncat di input terkontrol yang terikat state Valtio.
  const state = useProxy(laporanBulanan, { sync: true });
  const router = useRouter();

  useShallowEffect(() => {
    laporanBulanan.create.reset();
    laporanBulanan.banjarOptions.load();
  }, []);

  const handleSubmit = async () => {
    if (await laporanBulanan.create.submit()) router.push(LIST_PATH);
  };

  return (
    <Box px={{ base: 0, md: 'xs' }} py="xs">
      <Group mb="md">
        <Button variant="subtle" onClick={() => router.push(LIST_PATH)} p="xs" radius="md" aria-label="Kembali">
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
        <Title order={4} ml="sm" c="dark">Tambah Laporan Bulanan</Title>
      </Group>
      <LaporanBulananForm
        form={state.create.form}
        loading={state.create.loading}
        submitLabel="Simpan"
        banjarOptions={state.banjarOptions.data}
        onSubmit={handleSubmit}
      />
    </Box>
  );
}
