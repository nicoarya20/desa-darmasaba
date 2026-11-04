'use client'
import colors from '@/con/colors';
import {
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
import { IconDeviceImacCog, IconPlus, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import artikelKesehatanState from '../../../_state/kesehatan/data_kesehatan_warga/artikelKesehatan';

// Strip tag HTML dari konten rich-text (CreateEditor/Tiptap) untuk preview teks polos di tabel
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function ArtikelKesehatan() {
  const [search, setSearch] = useState("");

  return (
    <Box>
      {/* Header Search */}
      <HeaderSearch
        title='Artikel Kesehatan'
        placeholder='Cari judul atau konten...'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />

      <ListArtikelKesehatan search={search} />
    </Box>
  );
}

function ListArtikelKesehatan({ search }: { search: string }) {
  const stateArtikel = useProxy(artikelKesehatanState);
  const router = useRouter();

  const { data, page, totalPages, loading, load } = stateArtikel.findMany;
  const [debouncedSearch] = useDebouncedValue(search, 1000);

  useShallowEffect(() => {
    load(page, 10, debouncedSearch);
  }, [page, debouncedSearch]);

  const filteredData = data || [];

  if (loading || !data) {
    return (
      <Stack py={10}>
        <Skeleton height={600} radius="md" />
      </Stack>
    );
  }

  return (
    <Box py={10}>
      <Paper withBorder bg={colors['white-1']} p={'lg'} shadow="md" radius="md">
        {/* Judul + Tombol Tambah */}
        <Group justify="space-between" mb="md">
          <Title order={4}>Daftar Artikel Kesehatan</Title>
          <Button
            leftSection={<IconPlus size={18} />}
            color="blue"
            variant="light"
            onClick={() => router.push('/admin/kesehatan/data-kesehatan-warga/artikel_kesehatan/create')}
          >
            Tambah Baru
          </Button>
        </Group>

        {/* Tabel — Desktop (≥md) */}
        <Table
          visibleFrom="md"
          highlightOnHover
          layout="fixed"
          withColumnBorders={false}
        >
          <TableThead>
            <TableTr>
              <TableTh style={{ minWidth: 200 }}>Judul</TableTh>
              <TableTh style={{ minWidth: 200 }}>Konten</TableTh>
              <TableTh style={{ minWidth: 200 }}>Aksi</TableTh>
            </TableTr>
          </TableThead>
          <TableTbody>
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <TableTr key={item.id}>
                  <TableTd style={{ minWidth: 200 }}>
                    <Text fw={500} truncate="end" lineClamp={1}>
                      {item.title}
                    </Text>
                  </TableTd>
                  <TableTd style={{ minWidth: 200 }} >
                    <Text truncate fz="sm" c="dimmed" lineClamp={1}>
                      {stripHtml(item.content)}
                    </Text>
                  </TableTd>
                  <TableTd style={{ minWidth: 200 }}>
                    <Button
                      variant="light"
                      color="blue"
                      onClick={() => router.push(`/admin/kesehatan/data-kesehatan-warga/artikel_kesehatan/${item.id}`)}
                    >
                      <IconDeviceImacCog size={20} />
                      <Text ml={5}>Detail</Text>
                    </Button>
                  </TableTd>
                </TableTr>
              ))
            ) : (
              <TableTr>
                <TableTd colSpan={3}>
                  <Center py={20}>
                    <Text c="dimmed">Tidak ada artikel yang cocok</Text>
                  </Center>
                </TableTd>
              </TableTr>
            )}
          </TableTbody>
        </Table>

        {/* Kartu — Mobile (<md) */}
        <Stack gap="sm" hiddenFrom="md">
          {filteredData.length > 0 ? (
            filteredData.map((item) => (
              <Paper key={item.id} withBorder p="sm" radius="md">
                <Stack gap="xs">
                  <Box>
                    <Text size="xs" c="dimmed">Judul</Text>
                    <Text fw={500} lineClamp={2}>{item.title}</Text>
                  </Box>
                  <Box>
                    <Text size="xs" c="dimmed">Konten</Text>
                    <Text fz="sm" c="dimmed" lineClamp={2}>
                      {stripHtml(item.content)}
                    </Text>
                  </Box>
                  <Button
                    fullWidth
                    variant="light"
                    color="blue"
                    leftSection={<IconDeviceImacCog size={20} />}
                    onClick={() => router.push(`/admin/kesehatan/data-kesehatan-warga/artikel_kesehatan/${item.id}`)}
                  >
                    Detail
                  </Button>
                </Stack>
              </Paper>
            ))
          ) : (
            <Center py={20}>
              <Text c="dimmed">Tidak ada artikel yang cocok</Text>
            </Center>
          )}
        </Stack>
      </Paper>

      {/* Pagination */}
      <Center>
        <Pagination
          value={page}
          onChange={(newPage) => {
            load(newPage, 10);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          total={totalPages}
          mt="md"
          mb="md"
          color="blue"
          radius="md"
        />
      </Center>
    </Box>
  );
}

export default ArtikelKesehatan;
