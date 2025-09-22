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
import { useShallowEffect } from '@mantine/hooks';
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

  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = listState.findMany;

  useShallowEffect(() => {
    load(page, 10, search)
  }, [page, search])

  const filteredData = data || []

  if (loading || !data) {
    return (
      <Stack py={10}>
        <Skeleton height={600} radius="md" />
      </Stack>
    );
  }

  return (
    <Box py={10}>
      <Paper withBorder bg={colors['white-1']} p="lg" shadow="md" radius="md">
        <Group justify="space-between" mb="md">
          <Title order={4}>Daftar Kegiatan Desa</Title>
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
        <Box style={{ overflowX: 'auto' }}>
          <Table highlightOnHover>
            <TableThead>
              <TableTr>
                <TableTh style={{ width: '30%' }}>Judul</TableTh>
                <TableTh style={{ width: '25%' }}>Kategori</TableTh>
                <TableTh style={{ width: '25%' }}>Lokasi</TableTh>
                <TableTh style={{ width: '15%' }}>Aksi</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>
                      <Text fw={500} truncate="end" lineClamp={1}>
                        {item.judul}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Text fz="sm" c="dimmed">
                        {item.kategoriKegiatan?.nama || '-'}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Text fz="sm">{item.lokasi}</Text>
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
                      <Text c="dimmed">
                        Tidak ada kegiatan desa yang cocok dengan pencarian
                      </Text>
                    </Center>
                  </TableTd>
                </TableTr>
              )}
            </TableTbody>
          </Table>
        </Box>
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
