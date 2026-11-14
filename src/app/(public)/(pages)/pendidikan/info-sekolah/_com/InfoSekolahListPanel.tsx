'use client';
import colors from '@/con/colors';
import { Box, Center, Group, Pagination, Paper, Select, Skeleton, Stack, Table, Text, TextInput, Title } from '@mantine/core';
import { useDebouncedCallback } from '@mantine/hooks';
import { IconLayersSubtract, IconSearch } from '@tabler/icons-react';
import { useState, type ReactNode } from 'react';
import {
  emptyMessage,
  INFO_SEKOLAH_SEARCH_DEBOUNCE_MS,
  jenjangOptions,
  type InfoSekolahQuery,
} from './info-sekolah.logic';

export type InfoSekolahColumn<T> = { header: string; width: string; render: (row: T) => ReactNode };

type Props<T extends { id: string }> = {
  title: string;
  icon: ReactNode;
  /** Kata benda untuk ringkasan & pesan kosong, mis. "lembaga". */
  noun: string;
  columns: readonly InfoSekolahColumn<T>[];
  rows: readonly T[] | null;
  loading: boolean;
  total: number;
  totalPages: number;
  query: InfoSekolahQuery;
  jenjangNames: readonly string[];
  onJenjang: (next: string) => void;
  onSearch: (next: string) => void;
  onPage: (next: number) => void;
};

/**
 * Panel tabel publik Info Sekolah (Lembaga/Siswa/Pengajar): judul, filter jenjang, kolom cari, tabel, paginasi.
 * Kontrol tetap terpasang saat memuat; hanya isi tabel yang diganti kerangka, supaya kolom cari tidak kehilangan fokus.
 */
export function InfoSekolahListPanel<T extends { id: string }>({
  title,
  icon,
  noun,
  columns,
  rows,
  loading,
  total,
  totalPages,
  query,
  jenjangNames,
  onJenjang,
  onSearch,
  onPage,
}: Props<T>) {
  const [value, setValue] = useState(query.search);
  const [prevSearch, setPrevSearch] = useState(query.search);
  const commit = useDebouncedCallback((next: string) => onSearch(next.trim()), INFO_SEKOLAH_SEARCH_DEBOUNCE_MS);

  // URL berubah dari luar (tombol kembali browser): samakan isi kolom, kecuali URL itu hasil ketikan sendiri.
  if (query.search !== prevSearch) {
    setPrevSearch(query.search);
    if (query.search !== value.trim()) setValue(query.search);
  }

  const empty = !loading && (rows?.length ?? 0) === 0;

  return (
    <Box py="lg">
      <Paper bg={colors['white-1']} p="lg" radius="xl" shadow="sm" withBorder>
        <Group justify="space-between" align="center" mb="md" gap="md">
          <Group gap="sm">
            {icon}
            <Title order={2} fz="xl" c={colors['blue-button']}>{title}</Title>
          </Group>
          <Group gap="sm" wrap="wrap">
            <Select
              aria-label="Filter jenjang pendidikan"
              placeholder="Semua jenjang"
              data={jenjangOptions(jenjangNames, query.jenjang)}
              value={query.jenjang || null}
              onChange={(next) => onJenjang(next ?? '')}
              clearable
              w={180}
            />
            <TextInput
              aria-label={`Cari ${noun}`}
              placeholder="pencarian"
              leftSection={<IconSearch size={20} />}
              value={value}
              onChange={(event) => {
                setValue(event.currentTarget.value);
                commit(event.currentTarget.value);
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') commit.flush();
              }}
            />
          </Group>
        </Group>

        {loading || !rows ? (
          <Skeleton h={360} radius="md" />
        ) : empty ? (
          <Stack align="center" justify="center" py="xl" gap="sm" role="status">
            <IconLayersSubtract size={48} stroke={1.5} color="gray" />
            <Text fz="lg" c="dimmed" ta="center">{emptyMessage(noun, query)}</Text>
          </Stack>
        ) : (
          <>
            <Text fz="sm" c="dimmed" mb="xs" aria-live="polite">
              Menampilkan <Text component="span" fw={700} c="dark">{total.toLocaleString('id-ID')}</Text> {noun}
            </Text>
            <Table.ScrollContainer minWidth={480}>
              <Table striped highlightOnHover withTableBorder withRowBorders horizontalSpacing="md" verticalSpacing="sm" fz="sm">
                <Table.Thead>
                  <Table.Tr>
                    {columns.map((col) => (
                      <Table.Th key={col.header} w={col.width}>{col.header}</Table.Th>
                    ))}
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {rows.map((row) => (
                    <Table.Tr key={row.id}>
                      {columns.map((col) => (
                        <Table.Td key={col.header}>{col.render(row)}</Table.Td>
                      ))}
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          </>
        )}
      </Paper>

      {!loading && totalPages > 1 && (
        <Center mt="lg">
          <Pagination value={query.page} onChange={onPage} total={totalPages} size="md" radius="xl" withEdges />
        </Center>
      )}
    </Box>
  );
}
