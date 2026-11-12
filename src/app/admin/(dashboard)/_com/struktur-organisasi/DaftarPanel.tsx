import colors from '@/con/colors';
import { Button, Center, Group, Paper, Skeleton, Text, Title } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import type { ReactNode } from 'react';
import { STRUKTUR_ADMIN_TEXT as T } from './struktur-admin.text';

type Props = {
  title: string;
  /** Tombol "Tambah Baru"; dihilangkan bila tidak diisi. */
  onAdd?: () => void;
  /** Kerangka saat data pertama kali dimuat. */
  loading?: boolean;
  /** Teks saat daftar kosong; `children` diabaikan. */
  emptyText?: string | null;
  /** Konten di bawah judul (filter, dsb.), tampil juga saat kosong. */
  toolbar?: ReactNode;
  children?: ReactNode;
};

/** Panel daftar admin: judul + tombol tambah, kerangka memuat, keadaan kosong, lalu isi (tabel). */
export function DaftarPanel({ title, onAdd, loading, emptyText, toolbar, children }: Props) {
  return (
    <Paper withBorder bg={colors['white-1']} p="lg" shadow="md" radius="md">
      <Group justify="space-between" mb="md">
        <Title order={4} lh={1.2}>{title}</Title>
        {onAdd ? (
          <Button leftSection={<IconPlus size={18} />} color="blue" variant="light" onClick={onAdd}>
            {T.add}
          </Button>
        ) : null}
      </Group>
      {toolbar}
      {loading ? (
        <Skeleton height={240} radius="md" />
      ) : emptyText ? (
        <Center py="xl">
          <Text c="dimmed">{emptyText}</Text>
        </Center>
      ) : (
        children
      )}
    </Paper>
  );
}
