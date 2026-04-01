'use client'
import colors from '@/con/colors';
import { Box, Button, Center, Group, Pagination, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text, Title } from '@mantine/core';
import { useDebouncedValue, useShallowEffect } from '@mantine/hooks';
import { IconDeviceImacCog, IconPlus, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../_com/header';
import sdgsDesa from '../../_state/landing-page/sdgs-desa';

function SdgsDesa() {
  const [search, setSearch] = useState('');
  return (
    <Box>
      <HeaderSearch
        title='Sdgs Desa'
        placeholder='Cari Sdgs Desa...'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListSdgsDesa search={search} />
    </Box>
  );
}

function ListSdgsDesa({ search }: { search: string }) {
  const listState = useProxy(sdgsDesa);
  const router = useRouter();
  const [debouncedSearch] = useDebouncedValue(search, 1000);


  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = listState.findMany;

  useShallowEffect(() => {
    load(page, 10, debouncedSearch);
  }, [page, debouncedSearch]);

  const filteredData = data || [];

  // Handle loading state
  if (loading || !data) {
    return (
      <Stack py={10}>
        <Skeleton height={550} />
      </Stack>
    );
  }

  const isEmpty = data.length === 0;

  return (
    <Box py={{ base: 'sm', md: 'lg' }}>
      <Paper withBorder bg={colors['white-1']} p={{ base: 'md', md: 'lg' }} shadow="md" radius="md">
        <Group justify="space-between" mb={{ base: 'sm', md: 'md' }}>
          <Title order={4} lh={1.2}>
            Daftar Sdgs Desa
          </Title>
          <Button
            leftSection={<IconPlus size={18} />}
            color='blue'
            variant="light"
            onClick={() => router.push('/admin/landing-page/SDGs/create')}
          >
            Tambah Baru
          </Button>
        </Group>

        {/* Desktop Table */}
       <Box visibleFrom="md" style={{ overflowX: 'auto' }}>
         <Table highlightOnHover
    layout="fixed" // 🔥 PENTING
    withColumnBorders={false} striped verticalSpacing="sm">
            <TableThead>
              <TableTr>
                <TableTh style={{ width: '60%' }}>
                  <Text fz="sm" fw={600} c="dark.7" ta="left">
                    Nama Sdgs Desa
                  </Text>
                </TableTh>
                <TableTh style={{ width: '20%' }}>
                  <Text fz="sm" fw={600} c="dark.7" ta="left">
                    Jumlah
                  </Text>
                </TableTh>
                <TableTh style={{ width: '20%' }}>
                  <Text fz="sm" fw={600} c="dark.7" ta="center">
                    Aksi
                  </Text>
                </TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {isEmpty ? (
                <TableTr>
                  <TableTd colSpan={3} ta="center" py="xl">
                    <Text c="dimmed" fz="sm" lh={1.5}>
                      Tidak ada data Sdgs Desa
                    </Text>
                  </TableTd>
                </TableTr>
              ) : (
                filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd style={{ width: '60%' }}>
                      <Text fz="md" fw={500} truncate="end" lineClamp={1} lh={1.5}>
                        {item.name}
                      </Text>
                    </TableTd>
                    <TableTd style={{ width: '20%' }}>
                      <Text fz="sm" c="dark.6" lh={1.5}>
                        {item.jumlah || '0'}
                      </Text>
                    </TableTd>
                    <TableTd style={{ width: '20%' }} ta="center">
                      <Button
                        size="xs"
                        radius="md"
                        variant="light"
                        color="blue"
                        leftSection={<IconDeviceImacCog size={16} />}
                        onClick={() => router.push(`/admin/landing-page/SDGs/${item.id}`)}
                      >
                        Detail
                      </Button>
                    </TableTd>
                  </TableTr>
                ))
              )}
            </TableTbody>
          </Table>
        </Box>

        {/* Mobile Cards */}
        <Box hiddenFrom="md">
          {isEmpty ? (
            <Center py="xl">
              <Text c="dimmed" fz="sm" lh={1.5} ta="center">
                Tidak ada data Sdgs Desa
              </Text>
            </Center>
          ) : (
            <Stack gap="sm">
              {filteredData.map((item) => (
                <Paper key={item.id} withBorder p="md" radius="md">
                  <Stack gap={'xs'}>
                    <Box>
                      <Text fz="sm" fw={600} lh={1.4}>Nama SDGs Desa</Text>
                      <Text fz="sm" fw={500} lh={1.4}>
                        {item.name}
                      </Text>
                    </Box>
                    <Box>
                      <Text fz="sm" fw={600} lh={1.4}>Jumlah</Text>
                      <Text fz="xs" c="dark.6" lh={1.4}>
                        {item.jumlah || '0'}
                      </Text>
                    </Box>
                    <Group justify="flex-end" mt="xs">
                      <Button
                        size="xs"
                        radius="md"
                        variant="light"
                        color="blue"
                        leftSection={<IconDeviceImacCog size={16} />}
                        onClick={() => router.push(`/admin/landing-page/SDGs/${item.id}`)}
                      >
                        Detail
                      </Button>
                    </Group>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          )}
        </Box>
      </Paper>

      {!isEmpty && (
        <Center mt={{ base: 'md', md: 'lg' }}>
          <Pagination
            value={page}
            onChange={(newPage) => {
              load(newPage, 10);
              window.scrollTo(0, 0);
            }}
            total={Math.max(1, totalPages)}
            withEdges
            radius="md"
          />
        </Center>
      )}
    </Box>
  );
}

export default SdgsDesa;