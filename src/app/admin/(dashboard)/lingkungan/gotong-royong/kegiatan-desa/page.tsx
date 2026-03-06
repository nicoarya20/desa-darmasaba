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
import { useDebouncedValue, useShallowEffect } from '@mantine/hooks';
import { IconDeviceImacCog, IconPlus, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import gotongRoyongState from '../../../_state/lingkungan/gotong-royong';

function KegiatanDesa() {
  const [search, setSearch] = useState('');
  return (
    <Box>
      <HeaderSearch
        title="Kegiatan Desa"
        placeholder="Cari judul, lokasi, atau kategori kegiatan..."
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListKegiatanDesa search={search} />
    </Box>
  );
}

function ListKegiatanDesa({ search }: { search: string }) {
  const listState = useProxy(gotongRoyongState.kegiatanDesa);
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

  if (loading || !data) {
    return (
      <Stack py={{ base: 'sm', md: 'md' }}>
        <Skeleton height={600} radius="md" />
      </Stack>
    );
  }

  return (
    <Box py={{ base: 'sm', md: 'md' }}>
      <Paper withBorder bg={colors['white-1']} p={{ base: 'sm', md: 'lg' }} shadow="md" radius="md">
        <Group justify="space-between" mb={{ base: 'sm', md: 'md' }}>
          <Title order={4} lh={1.2}>
            Daftar Kegiatan Desa
          </Title>
          <Button
            leftSection={<IconPlus size={18} />}
            color="blue"
            variant="light"
            onClick={() =>
              router.push('/admin/lingkungan/gotong-royong/kegiatan-desa/create')
            }
          >
            Tambah Baru
          </Button>
        </Group>

        {/* Desktop: Table */}
       <Box visibleFrom="md" style={{ overflowX: 'auto' }}>
          <Table
            highlightOnHover
            miw={0}
            style={{
              tableLayout: 'fixed',
              width: '100%',
            }}
          >
            <TableThead>
              <TableTr>
                <TableTh style={{ width: '30%' }}>
                  <Text fz="sm" fw={600} lh={1.4} c="dark">
                    Judul
                  </Text>
                </TableTh>
                <TableTh style={{ width: '25%' }}>
                  <Text fz="sm" fw={600} lh={1.4} c="dark">
                    Kategori
                  </Text>
                </TableTh>
                <TableTh style={{ width: '25%' }}>
                  <Text fz="sm" fw={600} lh={1.4} c="dark">
                    Lokasi
                  </Text>
                </TableTh>
                <TableTh style={{ width: '20%' }}>
                  <Text fz="sm" fw={600} lh={1.4} c="dark">
                    Aksi
                  </Text>
                </TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>
                      <Text
                        fz="md"
                        fw={500}
                        lh={1.5}
                        truncate="end"
                        lineClamp={1}
                        c="dark"
                      >
                        {item.judul}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Text
                        fz="sm"
                        fw={500}
                        lh={1.5}
                        c="dark"
                      >
                        {item.kategoriKegiatan?.nama || '-'}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Text
                        fz="sm"
                        fw={500}
                        lh={1.5}
                        c="dark"
                      >
                        {item.lokasi}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Button
                        size="xs"
                        radius="md"
                        variant="light"
                        color="blue"
                        leftSection={<IconDeviceImacCog size={16} />}
                        onClick={() =>
                          router.push(
                            `/admin/lingkungan/gotong-royong/kegiatan-desa/${item.id}`
                          )
                        }
                      >
                        Detail
                      </Button>
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={4}>
                    <Center py={20}>
                      <Text fz="sm" c="dimmed" lh={1.4}>
                        Tidak ada kegiatan desa yang cocok dengan pencarian
                      </Text>
                    </Center>
                  </TableTd>
                </TableTr>
              )}
            </TableTbody>
          </Table>
        </Box>

        {/* Mobile: Card List */}
        <Stack hiddenFrom="md" gap="xs">
          {filteredData.length > 0 ? (
            filteredData.map((item) => (
              <Paper key={item.id} withBorder radius="md" p="sm">
                <Stack gap={"xs"}>
                  <Box>
                    <Text fz="sm" fw={600} lh={1.4} c="dark">
                      Judul
                    </Text>
                    <Text fz="sm" fw={500} lh={1.4} c="dark" truncate="end">
                      {item.judul}
                    </Text>
                  </Box>
                  <Box>
                    <Text fz="sm" fw={600} lh={1.4} c="dark">
                      Kategori
                    </Text>
                    <Text fz="sm" fw={500} lh={1.4} c="dark">
                      {item.kategoriKegiatan?.nama || '-'}
                    </Text>
                  </Box>
                  <Box>
                    <Text fz="sm" fw={600} lh={1.4} c="dark">
                      Lokasi
                    </Text>
                    <Text fz="sm" fw={500} lh={1.4} c="dark">
                      {item.lokasi}
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
                        router.push(
                          `/admin/lingkungan/gotong-royong/kegiatan-desa/${item.id}`
                        )
                      }
                    >
                      Detail
                    </Button>
                  </Box>
                </Stack>
              </Paper>
            ))
          ) : (
            <Center py={20}>
              <Text fz="sm" c="dimmed" lh={1.4}>
                Tidak ada kegiatan desa yang cocok dengan pencarian
              </Text>
            </Center>
          )}
        </Stack>
      </Paper>
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

export default KegiatanDesa;