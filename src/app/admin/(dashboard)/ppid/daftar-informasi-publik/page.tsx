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
  Title,
} from '@mantine/core';
import { useDebouncedValue, useShallowEffect, useViewportSize } from '@mantine/hooks';
import { IconDeviceImacCog, IconPlus, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../_com/header';
import daftarInformasiPublik from '../../_state/ppid/daftar_informasi_publik/daftarInformasiPublik';

function DaftarInformasiPublik() {
  const [search, setSearch] = useState('');
  return (
    <Box>
      <HeaderSearch
        title='Daftar Informasi Publik'
        placeholder='Cari jenis informasi atau deskripsi...'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListDaftarInformasi search={search} />
    </Box>
  );
}

function ListDaftarInformasi({ search }: { search: string }) {
  const listData = useProxy(daftarInformasiPublik);
  const router = useRouter();
  const [debouncedSearch] = useDebouncedValue(search, 1000);

  const { data, page, totalPages, loading, load } = listData.findMany;
  const { width } = useViewportSize();
  const isMobile = width < 768;

  useShallowEffect(() => {
    load(page, 10, debouncedSearch);
  }, [page, debouncedSearch]);

  const filteredData = data || [];

  if (loading || !data) {
    return (
      <Stack py="md">
        <Skeleton height={600} radius="md" />
      </Stack>
    );
  }

  return (
    <Box py={{ base: 'md', md: 'lg' }}>
      <Paper withBorder bg={colors['white-1']} p={{ base: 'sm', md: 'lg' }} shadow="md" radius="md">
        <Group justify="space-between" mb={{ base: 'sm', md: 'md' }}>
          <Title order={2} lh={1.2}>
            List Daftar Informasi Publik
          </Title>
          <Button
            leftSection={<IconPlus size={18} />}
            color="blue"
            variant="light"
            onClick={() => router.push('/admin/ppid/daftar-informasi-publik/create')}
          >
            {isMobile ? 'Tambah' : 'Tambah Baru'}
          </Button>
        </Group>

        {filteredData.length === 0 ? (
          <Stack align="center" py="xl">
            <IconDeviceImacCog size={40} stroke={1.5} color={colors['blue-button']} />
            <Text fz={{ base: 'sm', md: 'md' }} fw={500} c="dimmed" lh={1.5}>
              Belum ada informasi publik yang tersedia
            </Text>
          </Stack>
        ) : (
          <>
            {/* Desktop Table */}
            <Box visibleFrom="md" style={{ overflowX: 'auto' }}>
              <Table
                highlightOnHover
                striped
                stickyHeader
                style={{ minWidth: '700px' }}
              >
                <TableThead>
                  <TableTr>
                    <TableTh w="25%">
                      <Text fw={600} lh={1.4}>
                        Jenis Informasi
                      </Text>
                    </TableTh>
                    <TableTh w="40%">
                      <Text fw={600} lh={1.4}>
                        Deskripsi
                      </Text>
                    </TableTh>
                    <TableTh ta="center" w="20%">
                      <Text fw={600} lh={1.4}>
                        Aksi
                      </Text>
                    </TableTh>
                  </TableTr>
                </TableThead>
                <TableTbody>
                  {filteredData.map((item) => (
                    <TableTr key={item.id}>
                      <TableTd>
                        <Text fz="sm" fw={600} lh={1.5} lineClamp={1}>
                          {item.jenisInformasi}
                        </Text>
                      </TableTd>
                      <TableTd>
                        <Text fz="sm" lh={1.5} c="dimmed" lineClamp={1}>
                          {item.deskripsi?.replace(/<[^>]*>?/gm, '').substring(0, 80)}...
                        </Text>
                      </TableTd>
                      <TableTd ta="center">
                        <Button
                          size="xs"
                          radius="md"
                          variant="light"
                          color="blue"
                          leftSection={<IconDeviceImacCog size={16} />}
                          onClick={() =>
                            router.push(`/admin/ppid/daftar-informasi-publik/${item.id}`)
                          }
                        >
                          Detail
                        </Button>
                      </TableTd>
                    </TableTr>
                  ))}
                </TableTbody>
              </Table>
            </Box>

            {/* Mobile Card List */}
            <Stack hiddenFrom="md" gap="sm">
              {filteredData.map((item) => (
                <Paper key={item.id} withBorder p="sm" radius="md">
                  <Stack gap={4}>
                    <Box>
                      <Text fw={600} lh={1.4}>
                        Jenis Informasi
                      </Text>
                      <Text fz="sm" fw={500} lh={1.4}>
                        {item.jenisInformasi}
                      </Text>
                    </Box>
                    <Box>
                      <Text fw={600} lh={1.4}>
                        Deskripsi
                      </Text>
                      <Text fz="sm" fw={500} lh={1.5} c="dimmed">
                        {item.deskripsi?.replace(/<[^>]*>?/gm, '').substring(0, 80)}...
                      </Text>
                    </Box>
                    <Box>
                      <Button
                        size="xs"
                        radius="md"
                        variant="light"
                        color="blue"
                        leftSection={<IconDeviceImacCog size={16} />}
                        onClick={() =>
                          router.push(`/admin/ppid/daftar-informasi-publik/${item.id}`)
                        }
                      >
                        Detail
                      </Button>
                    </Box>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </>
        )}
      </Paper>

      <Center mt={{ base: 'lg', md: 'xl' }}>
        <Pagination
          value={page}
          onChange={(newPage) => {
            load(newPage, 10);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          total={totalPages}
          color="blue"
          radius="md"
        />
      </Center>
    </Box>
  );
}

export default DaftarInformasiPublik;