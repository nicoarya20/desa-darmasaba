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
import { useShallowEffect } from '@mantine/hooks';
import { IconDeviceImac, IconPlus, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../_com/header';
import lowonganKerjaState from '../../_state/ekonomi/lowongan-kerja';

function LowonganKerjaLokal() {
  const [search, setSearch] = useState("");

  return (
    <Box>
      <HeaderSearch
        title="Lowongan Kerja Lokal"
        placeholder="Cari pekerjaan atau perusahaan..."
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListLowonganKerjaLokal search={search} />
    </Box>
  );
}

function ListLowonganKerjaLokal({ search }: { search: string }) {
  const stateLowongan = useProxy(lowonganKerjaState);
  const router = useRouter();

  const { data, page, totalPages, loading, load } = stateLowongan.findMany;

  useShallowEffect(() => {
    load(page, 10, search);
  }, [page, search]);

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
      <Paper withBorder bg={colors['white-1']} p="lg" shadow="md" radius="md">
        <Group justify="space-between" mb="md">
          <Title order={4}>Daftar Lowongan Kerja Lokal</Title>
            <Button
              leftSection={<IconPlus size={18} />}
              color="blue"
              variant="light"
              onClick={() =>
                router.push('/admin/ekonomi/lowongan-kerja-lokal/create')
              }
            >
              Tambah Baru
            </Button>
        </Group>

        <Box style={{ overflowX: 'auto' }}>
          <Table highlightOnHover>
            <TableThead>
              <TableTr>
                <TableTh style={{ width: '25%' }}>Pekerjaan</TableTh>
                <TableTh style={{ width: '25%' }}>Nama Perusahaan</TableTh>
                <TableTh style={{ width: '20%' }}>Lokasi</TableTh>
                <TableTh style={{ width: '15%' }}>Aksi</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd style={{ width: '25%' }}>
                      <Text fw={500} truncate="end" lineClamp={1}>
                        {item.posisi}
                      </Text>
                    </TableTd>
                    <TableTd style={{ width: '25%' }}>
                      <Text truncate fz="sm" c="dimmed">
                        {item.namaPerusahaan}
                      </Text>
                    </TableTd>
                    <TableTd style={{ width: '20%' }}>
                      <Text truncate fz="sm" c="dimmed">
                        {item.lokasi}
                      </Text>
                    </TableTd>
                    <TableTd style={{ width: '15%' }}>
                      <Button
                        variant="light"
                        color="blue"
                        onClick={() =>
                          router.push(
                            `/admin/ekonomi/lowongan-kerja-lokal/${item.id}`
                          )
                        }
                      >
                        <IconDeviceImac size={20} />
                        <Text ml={5}>Detail</Text>
                      </Button>
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={4}>
                    <Center py={20}>
                      <Text color="dimmed">
                        Tidak ada data lowongan kerja yang cocok
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

export default LowonganKerjaLokal;
