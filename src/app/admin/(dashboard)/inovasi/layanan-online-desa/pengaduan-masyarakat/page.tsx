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
  Tooltip,
} from '@mantine/core';
import { IconDeviceImac, IconSearch } from '@tabler/icons-react';

import { useShallowEffect } from '@mantine/hooks';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import layananonlineDesa from '../../../_state/inovasi/layanan-online-desa';

function PengaduanMasyarakat() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      <HeaderSearch
        title='Pengaduan Masyarakat'
        placeholder='Cari nama, email, atau nomor telepon...'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListPengaduanMasyarakat search={search} />
    </Box>
  );
}

function ListPengaduanMasyarakat({ search }: { search: string }) {
  const listState = useProxy(layananonlineDesa.pengaduanMasyarakat);
  const router = useRouter();
  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = listState.findMany;

  useShallowEffect(() => {
    load(page, 10, search);
  }, [page, search]);

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
          <Title order={4}>Daftar Pengaduan Masyarakat</Title>
        </Group>
        <Box style={{ overflowX: "auto" }}>
          <Table highlightOnHover>
            <TableThead>
              <TableTr>
                <TableTh style={{ width: '25%' }}>Nama</TableTh>
                <TableTh style={{ width: '25%' }}>Email</TableTh>
                <TableTh style={{ width: '20%' }}>Nomor Telepon</TableTh>
                <TableTh style={{ width: '15%' }}>Aksi</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd style={{ width: '25%' }}>
                      <Text fw={500} truncate="end" lineClamp={1}>{item.name}</Text>
                    </TableTd>
                    <TableTd style={{ width: '25%' }}>
                      <Text fz="sm" c="dimmed" truncate lineClamp={1}>{item.email}</Text>
                    </TableTd>
                    <TableTd style={{ width: '20%' }}>
                      <Text fz="sm" c="dimmed" truncate lineClamp={1}>{item.nomorTelepon}</Text>
                    </TableTd>
                    <TableTd style={{ width: '15%' }}>
                      <Tooltip label="Lihat detail pengaduan" withArrow>
                        <Button
                          size="xs"
                          radius="md"
                          variant="light"
                          color="blue"
                          leftSection={<IconDeviceImac size={16} />}
                          onClick={() => router.push(`/admin/inovasi/layanan-online-desa/pengaduan-masyarakat/${item.id}`)}
                        >
                          Detail
                        </Button>
                      </Tooltip>
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={4}>
                    <Center py={20}>
                      <Text color="dimmed">Tidak ada data pengaduan yang cocok</Text>
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

export default PengaduanMasyarakat;
