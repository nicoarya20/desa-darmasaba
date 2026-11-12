'use client'
import colors from '@/con/colors';
import { Box, Button, Group, Loader, Paper, Stack, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { STRUKTUR_ADMIN_TEXT as T } from './struktur-admin.text';

type Props = {
  title: string;
  /** Tombol Simpan aktif hanya bila form valid dan tidak sedang menyimpan. */
  canSubmit: boolean;
  submitting: boolean;
  onSubmit: () => void;
  /** Tombol kiri: "Reset" (tambah) atau "Batal" (edit). */
  secondaryLabel: string;
  onSecondary: () => void;
  children: ReactNode;
};

/** Kerangka halaman form admin: tombol kembali + judul, kartu form, lalu tombol aksi. */
export function FormPanel({ title, canSubmit, submitting, onSubmit, secondaryLabel, onSecondary, children }: Props) {
  const router = useRouter();
  const disabled = !canSubmit || submitting;
  return (
    <Box px={{ base: 0, md: 'lg' }} py="xs">
      <Group mb="md">
        <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md" aria-label={T.back}>
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
        <Title order={4}>{title}</Title>
      </Group>
      <Paper w={{ base: '100%', md: '60%' }} bg={colors['white-1']} p="lg" radius="md" shadow="sm" withBorder>
        <Stack gap="md">
          {children}
          <Group justify="right">
            <Button variant="outline" color="gray" radius="md" onClick={onSecondary} disabled={submitting}>
              {secondaryLabel}
            </Button>
            <Button
              radius="md"
              onClick={onSubmit}
              disabled={disabled}
              style={{
                background: disabled
                  ? 'linear-gradient(135deg, #cccccc, #eeeeee)'
                  : `linear-gradient(135deg, ${colors['blue-button']}, #4facfe)`,
                color: '#fff',
              }}
            >
              {submitting ? <Loader size="sm" color="white" /> : T.save}
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}
