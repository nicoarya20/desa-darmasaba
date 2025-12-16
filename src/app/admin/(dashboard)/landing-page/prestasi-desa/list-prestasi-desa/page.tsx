'use client'
import colors from '@/con/colors';
import { Box, Button, Center, Group, Pagination, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text, Title } from '@mantine/core';
import { useMediaQuery, useShallowEffect } from '@mantine/hooks';
import { IconDeviceImacCog, IconPlus, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import prestasiState from '../../../_state/landing-page/prestasi-desa';

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

  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = listState.findMany

  useShallowEffect(() => {
    load(page, 10, search);
  }, []);

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
          <Title order={2} size={isMobile ? 'md' : 'lg'} lh={1.2}>
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
        <Box visibleFrom="md">
          <Table highlightOnHover miw={0}>
            <TableThead>
              <TableTr>
                <TableTh w="25%">Nama Prestasi</TableTh>
                <TableTh w="25%">Deskripsi</TableTh>
                <TableTh w="25%">Kategori</TableTh>
                <TableTh w="25%" ta="center">Aksi</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd w="25%">
                      <Text truncate="end" fz="md" lh={1.5}>
                        {item.name}
                      </Text>
                    </TableTd>
                    <TableTd w="25%">
                      <Text lineClamp={1} fz="md" c="dimmed" lh={1.5} dangerouslySetInnerHTML={{ __html: item.deskripsi }} />
                    </TableTd>
                    <TableTd w="25%">
                      <Text truncate="end" fz="md" lh={1.5}>
                        {item.kategori?.name || 'Tidak ada kategori'}
                      </Text>
                    </TableTd>
                    <TableTd w="25%" ta="center">
                      <Button
                        size="xs"
                        radius="md"
                        variant="light"
                        color="blue"
                        leftSection={<IconDeviceImacCog size={16} />}
                        onClick={() => router.push(`/admin/landing-page/prestasi-desa/list-prestasi-desa/${item.id}`)}
                      >
                        Detail
                      </Button>
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
                  <Stack gap={4}>
                    <Text fz="sm" fw={600} lh={1.4}>
                      {item.name}
                    </Text>
                    <Text fz="xs" c="dimmed" lh={1.5} lineClamp={1} dangerouslySetInnerHTML={{ __html: item.deskripsi }} />
                    <Text fz="xs" c="dimmed" lh={1.4}>
                      Kategori: {item.kategori?.name || 'Tidak ada kategori'}
                    </Text>
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

      {totalPages > 1 && (
        <Center mt={{ base: 'md', md: 'lg' }}>
          <Pagination
            value={page}
            onChange={load}
            total={totalPages}
            withEdges
            size={isMobile ? 'xs' : 'sm'}
          />
        </Center>
      )}
    </Box>
  )
}

export default ListPrestasiDesa;