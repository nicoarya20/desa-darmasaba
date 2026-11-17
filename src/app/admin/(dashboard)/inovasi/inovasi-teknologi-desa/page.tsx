'use client'
import colors from '@/con/colors';
import { inovasiKategoriLabel } from '@/lib/inovasi-teknologi/kategori';
import { htmlToPlainText } from '@/lib/rich-text';
import {
  Badge,
  Box,
  Button,
  Center,
  Group,
  Pagination,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
  Text,
  Title
} from '@mantine/core';
import { useDebouncedValue, useShallowEffect } from '@mantine/hooks';
import { IconDeviceImac, IconPlus, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../_com/header';
import inovasiTeknologiState, { type KategoriFilterValue } from '../../_state/inovasi/inovasi-teknologi-desa';
import { ADMIN_INOVASI_TEKNOLOGI_HREF, KategoriTabs } from './_com/kategori-inovasi';

const PAGE_SIZE = 10;
const EMPTY_TEXT = 'Tidak ada data inovasi teknologi desa yang cocok';

/** Halaman admin Inovasi Teknologi Desa: cari, tab kategori, tabel/kartu berpaginasi. */
function InovasiTeknologiDesaAdmin() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      <HeaderSearch
        title="Inovasi Teknologi Desa"
        placeholder="Cari inovasi teknologi desa..."
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListInovasiTeknologiDesa search={search} />
    </Box>
  );
}

function ListInovasiTeknologiDesa({ search }: { search: string }) {
  const state = useProxy(inovasiTeknologiState);
  const router = useRouter();
  const [debouncedSearch] = useDebouncedValue(search, 1000);
  const [kategori, setKategori] = useState<KategoriFilterValue>('');

  const { data, page, totalPages, loading, load } = state.findMany;

  // Kata kunci/kategori berganti → kembali ke halaman 1.
  useShallowEffect(() => {
    load(1, PAGE_SIZE, debouncedSearch, kategori);
  }, [debouncedSearch, kategori]);

  const items = data || [];
  const detailHref = (id: string) => `${ADMIN_INOVASI_TEKNOLOGI_HREF}/${id}`;

  return (
    <Box py="lg">
      <Paper withBorder bg={colors['white-1']} p="lg" shadow="md" radius="md">
        <Group justify="space-between" mb="md">
          <Title order={4} lh={1.2}>
            List Inovasi Teknologi Desa
          </Title>
          <Button
            leftSection={<IconPlus size={18} />}
            color="blue"
            variant="light"
            onClick={() => router.push(`${ADMIN_INOVASI_TEKNOLOGI_HREF}/create`)}
          >
            Tambah Baru
          </Button>
        </Group>

        <KategoriTabs value={kategori} onChange={setKategori} />

        {loading || !data ? (
          <Skeleton height={400} radius="md" />
        ) : (
          <>
            {/* Desktop Table */}
            <Box visibleFrom="sm">
              <Table highlightOnHover miw={0} style={{ tableLayout: 'fixed', width: '100%' }}>
                <TableThead>
                  <TableTr>
                    <TableTh style={{ width: '28%' }}><Text fz="sm" fw={600} lh={1.4}>Nama Inovasi</Text></TableTh>
                    <TableTh style={{ width: '20%' }}><Text fz="sm" fw={600} lh={1.4}>Kategori</Text></TableTh>
                    <TableTh style={{ width: '37%' }}><Text fz="sm" fw={600} lh={1.4}>Deskripsi Singkat</Text></TableTh>
                    <TableTh style={{ width: '15%' }}><Text fz="sm" fw={600} lh={1.4}>Aksi</Text></TableTh>
                  </TableTr>
                </TableThead>
                <TableTbody>
                  {items.length > 0 ? (
                    items.map((item) => (
                      <TableTr key={item.id}>
                        <TableTd>
                          <Text fz="md" fw={500} lh={1.5} truncate="end">{item.name}</Text>
                        </TableTd>
                        <TableTd>
                          <Badge variant="light" radius="sm" maw="100%">{inovasiKategoriLabel(item.kategori) || '-'}</Badge>
                        </TableTd>
                        <TableTd>
                          <Text fz="sm" c="dimmed" lh={1.5} lineClamp={1}>{htmlToPlainText(item.deskripsi) || '-'}</Text>
                        </TableTd>
                        <TableTd>
                          <Button variant="light" color="blue" onClick={() => router.push(detailHref(item.id))}>
                            <IconDeviceImac size={20} />
                            <Text ml={5} fz="sm" fw={500} lh={1.4}>Detail</Text>
                          </Button>
                        </TableTd>
                      </TableTr>
                    ))
                  ) : (
                    <TableTr>
                      <TableTd colSpan={4}>
                        <Center py="xl"><Text c="dimmed" fz="sm" lh={1.4}>{EMPTY_TEXT}</Text></Center>
                      </TableTd>
                    </TableTr>
                  )}
                </TableTbody>
              </Table>
            </Box>

            {/* Mobile Cards */}
            <Box hiddenFrom="sm">
              <Stack gap="md">
                {items.length > 0 ? (
                  items.map((item) => (
                    <Paper key={item.id} withBorder p="md" radius="md">
                      <Stack gap={4}>
                        <Text fz="sm" fw={600} lh={1.5}>{item.name}</Text>
                        <Badge variant="light" radius="sm">{inovasiKategoriLabel(item.kategori) || '-'}</Badge>
                        <Text fz="sm" c="dimmed" lh={1.5} lineClamp={2}>{htmlToPlainText(item.deskripsi) || '-'}</Text>
                        <Button variant="light" color="blue" fullWidth onClick={() => router.push(detailHref(item.id))}>
                          <IconDeviceImac size={20} />
                          <Text ml={5} fz="sm" fw={500} lh={1.4}>Detail</Text>
                        </Button>
                      </Stack>
                    </Paper>
                  ))
                ) : (
                  <Center py="xl"><Text c="dimmed" fz="sm" lh={1.4}>{EMPTY_TEXT}</Text></Center>
                )}
              </Stack>
            </Box>
          </>
        )}
      </Paper>
      {totalPages > 1 && (
        <Center>
          <Pagination
            value={page}
            onChange={(newPage) => {
              // Tanpa argumen lain: kata kunci & kategori terakhir dipakai ulang oleh state.
              load(newPage, PAGE_SIZE);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            total={totalPages}
            mt="md"
            mb="md"
            color="blue"
            radius="md"
          />
        </Center>
      )}
    </Box>
  );
}

export default InovasiTeknologiDesaAdmin;
