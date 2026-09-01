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
import { IconCircleDashedPlus, IconDeviceImacCog, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../_com/header';
import stateKesejahteraanMasyarakat from '../../_state/ekonomi/kesejahteraan-masyarakat';

/**
 * lineClamp Mantine memakai `display: -webkit-box`. Di WebKit (Safari/iOS),
 * clamp gagal kalau isinya mengandung tag blok (<p>, <div>, <ul>, <h1-6>)
 * -- teks tampil penuh dan overlap dengan elemen di bawahnya, tapi hanya
 * di Safari (mis. iPhone X). Deskripsi rich-text sering berisi tag blok,
 * jadi harus diratakan jadi plain text dulu sebelum di-clamp.
 *
 * Regex dipakai (bukan DOMParser) supaya tetap aman saat SSR. Pola sama
 * dengan fix di src/app/admin/(dashboard)/landing-page/profil/program-inovasi/page.tsx
 */
function toPlainText(html?: string | null) {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/(p|div|li|h[1-6]|tr)>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function KesejahteraanMasyarakat() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      <HeaderSearch
        title="Kesejahteraan Masyarakat"
        placeholder="Cari judul program kesejahteraan..."
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListKesejahteraan search={search} />
    </Box>
  );
}

function ListKesejahteraan({ search }: { search: string }) {
  const state = useProxy(stateKesejahteraanMasyarakat);
  const router = useRouter();
  const [debouncedSearch] = useDebouncedValue(search, 1000);

  const { data, page, totalPages, loading, load } = state.kesejahteraan.findMany;

  useShallowEffect(() => {
    load(page, 10, debouncedSearch);
  }, [page, debouncedSearch]);

  if (loading || !data) {
    return (
      <Stack py="md">
        <Skeleton height={600} radius="md" />
      </Stack>
    );
  }

  const filteredData = data || [];

  return (
    <Box py="md">
      <Paper withBorder bg={colors['white-1']} p="lg" shadow="md" radius="md">
        <Group justify="space-between" mb="md">
          <Title order={4}>Daftar Program Kesejahteraan</Title>
          <Button
            leftSection={<IconCircleDashedPlus size={18} />}
            color="blue"
            variant="light"
            onClick={() => router.push('/admin/ekonomi/kesejahteraan-masyarakat/create')}
          >
            Tambah Baru
          </Button>
        </Group>

        {/* Desktop Table */}
        <Box visibleFrom="md" style={{ overflowX: 'auto' }}>
          <Table highlightOnHover layout="fixed" withColumnBorders={false} miw={0}>
            <TableThead>
              <TableTr>
                <TableTh w="55%">Judul</TableTh>
                <TableTh w="25%">Deskripsi</TableTh>
                <TableTh w="20%">Aksi</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>
                      <Text fz="md" fw={600} lh={1.45} truncate="end">
                        {item.judul}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Text fz="sm" c="dimmed" lh={1.45} lineClamp={1}>{toPlainText(item.deskripsi) || '-'}</Text>
                    </TableTd>
                    <TableTd>
                      <Button
                        variant="light"
                        color="blue"
                        onClick={() =>
                          router.push(`/admin/ekonomi/kesejahteraan-masyarakat/${item.id}`)
                        }
                        fz="sm"
                        px="sm"
                        h={36}
                      >
                        <IconDeviceImacCog size={18} />
                        <Text ml="xs">Detail</Text>
                      </Button>
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={3}>
                    <Center py="xl">
                      <Text c="dimmed" fz="sm" lh={1.4}>
                        Tidak ada data program kesejahteraan yang cocok
                      </Text>
                    </Center>
                  </TableTd>
                </TableTr>
              )}
            </TableTbody>
          </Table>
        </Box>

        {/* Mobile Cards */}
        <Stack hiddenFrom="md" gap="sm" mt="sm">
          {filteredData.length > 0 ? (
            filteredData.map((item) => (
              <Paper key={item.id} withBorder p="md" radius="md">
                <Stack gap={"xs"}>
                  <Text fz="sm" fw={600} lh={1.4} c="dimmed">
                    Judul
                  </Text>
                  <Text fz="sm" fw={500} lh={1.45}>
                    {item.judul}
                  </Text>

                  <Button
                    variant="light"
                    color="blue"
                    fullWidth
                    mt="sm"
                    onClick={() =>
                      router.push(`/admin/ekonomi/kesejahteraan-masyarakat/${item.id}`)
                    }
                    fz="sm"
                    h={36}
                  >
                    <IconDeviceImacCog size={18} />
                    <Text ml="xs">Detail</Text>
                  </Button>
                </Stack>
              </Paper>
            ))
          ) : (
            <Center py="xl">
              <Text c="dimmed" fz="sm" lh={1.4}>
                Tidak ada data program kesejahteraan yang cocok
              </Text>
            </Center>
          )}
        </Stack>
      </Paper>

      <Center>
        <Pagination
          value={page}
          onChange={(newPage) => {
            load(newPage, 10, debouncedSearch);
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

export default KesejahteraanMasyarakat;
