'use client'
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';

type Props = {
  judul: string;
  /** Field form (di dalam kartu, di atas tombol Reset/Simpan). */
  children: ReactNode;
  onReset: () => void;
  onSimpan: () => void;
  /** False → tombol Simpan nonaktif. */
  valid: boolean;
  saving: boolean;
  /** Section tambahan di bawah kartu form (mis. pengurus & galeri di halaman edit). */
  sesudah?: ReactNode;
};

/** Kerangka halaman tambah/edit entri konten bersama (semua domain): tombol kembali, judul, kartu form, Reset/Simpan. */
export default function FormEntriFrame({ judul, children, onReset, onSimpan, valid, saving, sesudah }: Props) {
  const router = useRouter();
  return (
    <Box px={{ base: 0, md: 'lg' }} py="xs">
      <Group mb="md">
        <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md" aria-label="Kembali">
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
        <Title order={4} ml="sm" c="dark">{judul}</Title>
      </Group>

      <Paper w={{ base: '100%', md: '70%' }} bg={colors['white-1']} p="lg" radius="md" shadow="sm" withBorder>
        {children}
        <Group justify="right" mt="lg">
          <Button variant="outline" color="gray" radius="md" onClick={onReset}>
            Reset
          </Button>
          <Button radius="md" onClick={onSimpan} disabled={!valid} loading={saving}>
            Simpan
          </Button>
        </Group>
      </Paper>
      {sesudah}
    </Box>
  );
}
