/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import penghargaanState from '@/app/admin/(dashboard)/_state/desa/penghargaan';
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
import { IconDeviceImacCog, IconPlus, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../_com/header';
import { useDebouncedValue } from '@mantine/hooks';

function Penghargaan() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      <HeaderSearch
        title="Penghargaan"
        placeholder="Cari nama atau deskripsi..."
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListPenghargaan search={search} />
    </Box>
  );
}

function ListPenghargaan({ search }: { search: string }) {
  const state = useProxy(penghargaanState);
  const router = useRouter();
  const [debouncedSearch] = useDebouncedValue(search, 1000);

  const { data, page, totalPages, loading, load } = state.findMany;

  useEffect(() => {
    load(page, 10, debouncedSearch);
  }, [page, debouncedSearch]);

  const filteredData = data || [];

  // Loading state
  if (loading || !data) {
    return (
      <Stack py="md">
        <Skeleton h={600} radius="md" />
      </Stack>
    );
  }

  return (
    <Box py="md">
      <Paper withBorder bg={colors['white-1']} p="lg" shadow="md" radius="md">
        <Group justify="space-between" mb="lg">
          <Title order={2} visibleFrom="md">List Penghargaan</Title>
          <Title order={3} hiddenFrom="md">List Penghargaan</Title>
          <Button
            leftSection={<IconPlus size={18} />}
            color="blue"
            variant="light"
            onClick={() => router.push('/admin/desa/penghargaan/create')}
          >
            Tambah Baru
          </Button>
        </Group>

        {/* Desktop Table */}
        <Box visibleFrom="md">
          <Table highlightOnHover>
            <TableThead>
              <TableTr>
                <TableTh w="35%">Nama</TableTh>
                <TableTh w="35%">Deskripsi</TableTh>
                <TableTh w="30%">Aksi</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>
                      <Text fz="md" fw={500} lh={1.45} truncate="end" lineClamp={1}>
                        {item.name}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Text
                        fz="sm"
                        lh={1.45}
                        c="dimmed"
                        dangerouslySetInnerHTML={{ __html: item.deskripsi }}
                        style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}
                        lineClamp={1}
                      />
                    </TableTd>
                    <TableTd>
                      <Button
                        size="xs"
                        radius="md"
                        variant="light"
                        color="blue"
                        leftSection={<IconDeviceImacCog size={16} />}
                        onClick={() =>
                          router.push(`/admin/desa/penghargaan/${item.id}`)
                        }
                      >
                        Detail
                      </Button>
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={3}>
                    <Center py="xl">
                      <Text c="dimmed" fz="sm" lh={1.4}>
                        Tidak ada data penghargaan yang cocok
                      </Text>
                    </Center>
                  </TableTd>
                </TableTr>
              )}
            </TableTbody>
          </Table>
        </Box>

        {/* Mobile Cards */}
        <Stack gap="sm" hiddenFrom="md">
          {filteredData.length > 0 ? (
            filteredData.map((item) => (
              <Paper key={item.id} withBorder p="md" radius="md">
                <Box>
                  <Text fz="xs" fw={600} lh={1.4}>
                    Nama
                  </Text>
                  <Text fz="sm" fw={500} lh={1.45}>
                    {item.name}
                  </Text>
                </Box>
                <Box mt="xs">
                  <Text fz="xs" fw={600} lh={1.4}>
                    Deskripsi
                  </Text>
                  <Text lineClamp={3} fz="sm" fw={500} lh={1.45} c="dimmed">
                    <span dangerouslySetInnerHTML={{ __html: item.deskripsi }} />
                  </Text>
                </Box>
                <Group mt="md">
                  <Button
                    size="xs"
                    radius="md"
                    variant="light"
                    color="blue"
                    leftSection={<IconDeviceImacCog size={16} />}
                    onClick={() =>
                      router.push(`/admin/desa/penghargaan/${item.id}`)
                    }
                  >
                    Detail
                  </Button>
                </Group>
              </Paper>
            ))
          ) : (
            <Center py="xl">
              <Text c="dimmed" fz="sm" lh={1.4}>
                Tidak ada data penghargaan yang cocok
              </Text>
            </Center>
          )}
        </Stack>
      </Paper>

      <Center>
        <Pagination
          value={page}
          onChange={(newPage) => {
            load(newPage, 10, search);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          total={totalPages}
          mt="lg"
          mb="md"
          color="blue"
          radius="md"
        />
      </Center>
    </Box>
  );
}

export default Penghargaan;