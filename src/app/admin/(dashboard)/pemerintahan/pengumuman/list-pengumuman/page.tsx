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
import { useDebouncedValue, useShallowEffect } from '@mantine/hooks';
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
  const [debouncedSearch] = useDebouncedValue(search, 1000);

  const { data, page, totalPages, loading, load } = pengumumanState.pengumuman.findMany;

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
      <Paper withBorder bg={colors['white-1']} p={{ base: 'md', md: 'lg' }} shadow="md" radius="md">
        <Group justify="space-between" mb={{ base: 'sm', md: 'md' }}>
          <Title order={4} lh={1.2}>
            Daftar Pengumuman
          </Title>
          <Button
            leftSection={<IconCircleDashedPlus size={18} />}
            color="blue"
            variant="light"
            onClick={() => router.push('/admin/pemerintahan/pengumuman/list-pengumuman/create')}
            fz={{ base: 'sm', md: 'md' }}
          >
            Tambah Baru
          </Button>
        </Group>

        {/* Desktop Table */}
       <Box visibleFrom="md" style={{ overflowX: 'auto' }}>
         <Table highlightOnHover
    layout="fixed" // 🔥 PENTING
    withColumnBorders={false}>
            <TableThead>
              <TableTr>
                <TableTh fz="sm" fw={600} ta="left">
                  Judul
                </TableTh>
                <TableTh fz="sm" fw={600} ta="left">
                  Kategori
                </TableTh>
                <TableTh fz="sm" fw={600} ta="left">
                  Detail
                </TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>
                      <Text fz="md" fw={500} lh={1.45} truncate="end" lineClamp={1}>
                        {item.judul}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Text fz="sm" fw={500} lh={1.45} c="dimmed">
                        {item.CategoryPengumuman?.name || '-'}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Button
                        variant="light"
                        color="blue"
                        onClick={() =>
                          router.push(`/admin/pemerintahan/pengumuman/list-pengumuman/${item.id}`)
                        }
                        fz="sm"
                        px="sm"
                        py="xs"
                      >
                        <IconDeviceImacCog size={18} />
                        <Text ml="xs">Detail</Text>
                      </Button>
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={3}>
                    <Center py={{ base: 'sm', md: 'md' }}>
                      <Text c="dimmed" fz="sm" lh={1.4}>
                        Tidak ada pengumuman yang cocok
                      </Text>
                    </Center>
                  </TableTd>
                </TableTr>
              )}
            </TableTbody>
          </Table>
        </Box>

        {/* Mobile Card List */}
        <Box hiddenFrom="md">
          <Stack gap="xs">
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <Paper key={item.id} withBorder p="md" radius="sm">
                  <Stack gap="xs">
                    <Box>
                      <Text fz="sm" fw={600} lh={1.4}>
                        Judul
                      </Text>
                      <Text fz="sm" fw={500} lh={1.45}>
                        {item.judul}
                      </Text>
                    </Box>
                    <Box>
                      <Text fz="sm" fw={600} lh={1.4}>
                        Kategori
                      </Text>
                      <Text fz="sm" fw={500} lh={1.45} c="dimmed">
                        {item.CategoryPengumuman?.name || '-'}
                      </Text>
                    </Box>
                    <Box>
                      <Button
                        variant="light"
                        color="blue"
                        onClick={() =>
                          router.push(`/admin/pemerintahan/pengumuman/list-pengumuman/${item.id}`)
                        }
                        fullWidth
                        fz="sm"
                        mt="xs"
                      >
                        <IconDeviceImacCog size={18} />
                        <Text ml="xs">Detail</Text>
                      </Button>
                    </Box>
                  </Stack>
                </Paper>
              ))
            ) : (
              <Center py="sm">
                <Text c="dimmed" fz="sm" lh={1.4}>
                  Tidak ada pengumuman yang cocok
                </Text>
              </Center>
            )}
          </Stack>
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