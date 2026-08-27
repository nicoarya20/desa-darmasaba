'use client'
import colors from '@/con/colors';
import { Box, Button, Center, Group, Pagination, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text, Title } from '@mantine/core';
import { useDebouncedValue, useMediaQuery, useShallowEffect } from '@mantine/hooks';
import { IconDeviceImacCog, IconPlus, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import prestasiState from '../../../_state/landing-page/prestasi-desa';

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

function ListPrestasiDesa() {
  const [search, setSearch] = useState('');
  return (
    <Box>
      <HeaderSearch
        title='Prestasi Desa'
        placeholder='Cari nama prestasi...'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListPrestasi search={search} />
    </Box>
  );
}

function ListPrestasi({ search }: { search: string }) {
  const listState = useProxy(prestasiState.prestasiDesa)
  const router = useRouter();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [debouncedSearch] = useDebouncedValue(search, 1000); // 500ms delay

  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = listState.findMany

  useShallowEffect(() => {
    load(page, 10, debouncedSearch);
  }, [page, debouncedSearch]);

  const filteredData = data || []

  if (loading || !data) {
    return (
      <Stack py={{ base: 'sm', md: 'md' }}>
        <Skeleton height={600} radius="md" />
      </Stack>
    );
  }

  return (
    <Box py={{ base: 'sm', md: 'md' }}>
      <Paper withBorder bg={colors['white-1']} p={{ base: 'md', md: 'lg' }} shadow="md" radius="md">
        <Group justify="space-between" mb={{ base: 'sm', md: 'md' }}>
          <Title order={4} size={isMobile ? 'md' : 'lg'} lh={1.2}>
            Daftar Prestasi Desa
          </Title>
          <Button
            leftSection={<IconPlus size={18} />}
            color="blue"
            variant="light"
            onClick={() => router.push('/admin/landing-page/prestasi-desa/list-prestasi-desa/create')}
            size={isMobile ? 'xs' : 'sm'}
          >
            Tambah Baru
          </Button>
        </Group>

        {/* Desktop Table */}
        <Box visibleFrom="md" style={{ overflowX: 'auto' }}>
          <Table highlightOnHover
            layout="fixed" // 🔥 PENTING
            withColumnBorders={false} striped verticalSpacing="sm" miw={800}>
            <TableThead>
              <TableTr>
                <TableTh>Nama Prestasi</TableTh>
                <TableTh>Deskripsi</TableTh>
                <TableTh>Kategori</TableTh>
                <TableTh ta="center">Aksi</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd style={{ maxWidth: 250 }}>
                      <Text truncate="end" fz="md" lh={1.5}>
                        {item.name}
                      </Text>
                    </TableTd>
                    <TableTd style={{ maxWidth: 250 }}>
                      <Text lineClamp={1} fz="md" c="dimmed" lh={1.5}>{toPlainText(item.deskripsi) || '-'}</Text>
                    </TableTd>
                    <TableTd>
                      <Text truncate="end" fz="md" lh={1.5}>
                        {item.kategori?.name || 'Tidak ada kategori'}
                      </Text>
                    </TableTd>
                    <TableTd ta="center">
                      <Center>
                        <Button
                          size="sm"
                          radius="md"
                          variant="light"
                          color="blue"
                          leftSection={<IconDeviceImacCog size={16} />}
                          onClick={() => router.push(`/admin/landing-page/prestasi-desa/list-prestasi-desa/${item.id}`)}
                        >
                          Detail
                        </Button>
                      </Center>
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={4} ta="center">
                    <Text c="dimmed" py="md" fz="sm" lh={1.4}>
                      Tidak ada data prestasi
                    </Text>
                  </TableTd>
                </TableTr>
              )}
            </TableTbody>
          </Table>
        </Box>

        {/* Mobile Cards */}
        <Stack hiddenFrom="md" gap="xs">
          {filteredData.length > 0 ? (
            filteredData.map((item) => (
              <Paper key={item.id} withBorder p="sm" radius="sm">
                <Stack gap={"xs"}>
                  <Box>
                    <Text fz="sm" fw={600} lh={1.4}>Nama Prestasi</Text>
                    <Text fz="sm" fw={500} lh={1.4} lineClamp={2}>
                      {item.name}
                    </Text>
                  </Box>
                  <Box>
                    <Text fz="sm" fw={600} lh={1.4}>Deskripsi</Text>
                    <Text fz="sm" fw={500} lh={1.5} lineClamp={1}>{toPlainText(item.deskripsi) || '-'}</Text>
                  </Box>
                  <Box>
                    <Text fz="sm" fw={600} lh={1.4}>Kategori</Text>
                    <Text fz="sm" fw={500} lh={1.4}>
                      {item.kategori?.name || 'Tidak ada kategori'}
                    </Text>
                  </Box>
                  <Group justify="flex-end" mt="xs">
                    <Button
                      size="xs"
                      radius="md"
                      variant="light"
                      color="blue"
                      leftSection={<IconDeviceImacCog size={14} />}
                      onClick={() => router.push(`/admin/landing-page/prestasi-desa/list-prestasi-desa/${item.id}`)}
                    >
                      Detail
                    </Button>
                  </Group>
                </Stack>
              </Paper>
            ))
          ) : (
            <Center py="md">
              <Text c="dimmed" fz="sm" lh={1.4}>
                Tidak ada data prestasi
              </Text>
            </Center>
          )}
        </Stack>
      </Paper>

      <Center mt={{ base: 'md', md: 'lg' }}>
        <Pagination
          value={page}
          onChange={load}
          total={totalPages}
          withEdges
          size={isMobile ? 'xs' : 'sm'}
        />
      </Center>
    </Box>
  )
}

export default ListPrestasiDesa;