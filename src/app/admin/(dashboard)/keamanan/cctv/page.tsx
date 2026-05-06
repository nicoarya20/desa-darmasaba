'use client'
import colors from '@/con/colors';
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
  Title,
} from '@mantine/core';
import { useDebouncedValue, useShallowEffect } from '@mantine/hooks';
import { IconDeviceImacCog, IconPlus, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../_com/header';
import cctvState from '../../_state/keamanan/cctv';

function CctvPage() {
  const [search, setSearch] = useState('');

  return (
    <Box>
      <HeaderSearch
        title="CCTV Keamanan"
        placeholder="Cari kode, nama, atau lokasi..."
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListCctv search={search} />
    </Box>
  );
}

function ListCctv({ search }: { search: string }) {
  const state = useProxy(cctvState);
  const router = useRouter();
  const [debouncedSearch] = useDebouncedValue(search, 500);

  const { data, page, totalPages, loading } = state.findMany;

  useShallowEffect(() => {
    cctvState.findMany.search = debouncedSearch;
    cctvState.findMany.load();
  }, [page, debouncedSearch]);

  if (loading || !data) {
    return (
      <Stack py={{ base: 'sm', md: 'md' }}>
        <Skeleton height={600} radius="md" />
      </Stack>
    );
  }

  return (
    <Stack py={{ base: 'sm', md: 'md' }}>
      <Paper withBorder bg={colors['white-1']} p={{ base: 'sm', md: 'lg' }} shadow="md" radius="md">
        <Group justify="space-between" mb={{ base: 'sm', md: 'md' }}>
          <Title order={4}>Daftar CCTV</Title>
          <Button
            leftSection={<IconPlus size={18} />}
            color="blue"
            variant="light"
            onClick={() => router.push('/admin/keamanan/cctv/create')}
          >
            Tambah CCTV
          </Button>
        </Group>

        {/* Desktop Table */}
        <Box visibleFrom="md" style={{ overflowX: 'auto' }}>
          <Table highlightOnHover style={{ tableLayout: 'fixed', width: '100%' }}>
            <TableThead>
              <TableTr>
                <TableTh style={{ width: '15%' }}>Kode</TableTh>
                <TableTh style={{ width: '20%' }}>Nama</TableTh>
                <TableTh style={{ width: '25%' }}>Lokasi</TableTh>
                <TableTh style={{ width: '15%' }}>Status</TableTh>
                <TableTh style={{ width: '15%' }}>Terakhir Aktif</TableTh>
                <TableTh style={{ width: '10%' }}>Aksi</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {data.length > 0 ? (
                data.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>
                      <Text fz="sm" fw={600}>{item.kode}</Text>
                    </TableTd>
                    <TableTd>
                      <Text fz="sm" fw={500} lineClamp={1}>{item.nama}</Text>
                    </TableTd>
                    <TableTd>
                      <Text fz="sm" c="dimmed" lineClamp={1}>{item.lokasi}</Text>
                    </TableTd>
                    <TableTd>
                      <Badge
                        color={item.status === 'Online' ? 'green' : 'red'}
                        variant="light"
                        radius="sm"
                      >
                        {item.status}
                      </Badge>
                    </TableTd>
                    <TableTd>
                      <Text fz="xs" c="dimmed">
                        {new Date(item.lastActive).toLocaleString('id-ID', {
                          day: '2-digit', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Button
                        variant="light"
                        color="blue"
                        size="xs"
                        onClick={() => router.push(`/admin/keamanan/cctv/${item.id}`)}
                      >
                        <IconDeviceImacCog size={16} />
                        <Text ml={4} fz="xs" fw={500}>Detail</Text>
                      </Button>
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={6}>
                    <Center py={20}>
                      <Text c="dimmed" fz="sm">Tidak ada data CCTV</Text>
                    </Center>
                  </TableTd>
                </TableTr>
              )}
            </TableTbody>
          </Table>
        </Box>

        {/* Mobile Card */}
        <Stack hiddenFrom="md" gap="xs">
          {data.length > 0 ? (
            data.map((item) => (
              <Paper key={item.id} withBorder p="sm" radius="sm">
                <Stack gap="xs">
                  <Group justify="space-between">
                    <Text fz="sm" fw={700}>{item.kode}</Text>
                    <Badge
                      color={item.status === 'Online' ? 'green' : 'red'}
                      variant="light"
                      radius="sm"
                    >
                      {item.status}
                    </Badge>
                  </Group>
                  <Text fz="sm" fw={500}>{item.nama}</Text>
                  <Text fz="xs" c="dimmed">{item.lokasi}</Text>
                  <Text fz="xs" c="dimmed">
                    Terakhir aktif:{' '}
                    {new Date(item.lastActive).toLocaleString('id-ID', {
                      day: '2-digit', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </Text>
                  <Button
                    variant="light"
                    color="blue"
                    fullWidth
                    size="xs"
                    onClick={() => router.push(`/admin/keamanan/cctv/${item.id}`)}
                  >
                    <IconDeviceImacCog size={16} />
                    <Text ml={4} fz="xs" fw={500}>Detail</Text>
                  </Button>
                </Stack>
              </Paper>
            ))
          ) : (
            <Center py={20}>
              <Text c="dimmed" fz="sm">Tidak ada data CCTV</Text>
            </Center>
          )}
        </Stack>
      </Paper>

      <Center>
        <Pagination
          value={page}
          onChange={(newPage) => {
            cctvState.findMany.page = newPage;
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          total={totalPages}
          mt="md"
          mb="md"
          color="blue"
          radius="md"
        />
      </Center>
    </Stack>
  );
}

export default CctvPage;
