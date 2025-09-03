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
  Tooltip
} from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconCircleDashedPlus, IconDeviceImacCog, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import stateDesaPengumuman from '../../../_state/desa/pengumuman';

function Pengumuman() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      <HeaderSearch
        title="Pengumuman Desa"
        placeholder="Cari judul atau kategori..."
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListPengumuman search={search} />
    </Box>
  );
}

function ListPengumuman({ search }: { search: string }) {
  const pengumumanState = useProxy(stateDesaPengumuman);
  const router = useRouter();

  const { data, page, totalPages, loading, load } = pengumumanState.pengumuman.findMany;

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
          <Title order={4}>Daftar Pengumuman</Title>
          <Tooltip label="Tambah Pengumuman" withArrow>
            <Button
              leftSection={<IconCircleDashedPlus size={18} />}
              color="blue"
              variant="light"
              onClick={() => router.push('/admin/desa/pengumuman/list-pengumuman/create')}
            >
              Tambah Baru
            </Button>
          </Tooltip>
        </Group>
        <Box style={{ overflowX: 'auto' }}>
          <Table highlightOnHover style={{ minWidth: '700px' }}>
            <TableThead>
              <TableTr>
                <TableTh style={{ width: '40%' }}>Judul</TableTh>
                <TableTh style={{ width: '30%' }}>Kategori</TableTh>
                <TableTh style={{ width: '20%' }}>Detail</TableTh>
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
                        {item.CategoryPengumuman?.name || '-'}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Button
                        variant="light"
                        color="blue"
                        onClick={() =>
                          router.push(`/admin/desa/pengumuman/list-pengumuman/${item.id}`)
                        }
                      >
                        <IconDeviceImacCog size={20} />
                        <Text ml={5}>Detail</Text>
                      </Button>
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={3}>
                    <Center py={20}>
                      <Text color="dimmed">Tidak ada pengumuman yang cocok</Text>
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

export default Pengumuman;
