'use client'

import { Box, Button, Center, Group, Pagination, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text, Title } from '@mantine/core';
import { useDebouncedValue, useShallowEffect } from '@mantine/hooks';
import { IconDeviceImacCog, IconPlus, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import korupsiState from '../../../_state/landing-page/desa-anti-korupsi';

function DesaAntiKorupsi() {
  const [search, setSearch] = useState('');
  return (
    <Box>
      <HeaderSearch
        title="Program Desa Anti Korupsi"
        placeholder="Cari nama program atau kategori..."
        searchIcon={<IconSearch size={18} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListDesaAntiKorupsi search={search} />
    </Box>
  );
}

function ListDesaAntiKorupsi({ search }: { search: string }) {
  const router = useRouter();
  const listState = useProxy(korupsiState.desaAntikorupsi);
  const { data, page, totalPages, loading, load } = listState.findMany;
  const [debouncedSearch] = useDebouncedValue(search, 1000); // 500ms delay

  useShallowEffect(() => {
    load(page, 10, debouncedSearch);
  }, [page, debouncedSearch]);

  const filteredData = data || [];

  if (loading || !data) {
    return (
      <Stack py={{ base: 'sm', md: 'md' }}>
        <Skeleton height={650} radius="lg" />
      </Stack>
    );
  }

  if (data.length === 0) {
    return (
      <Box py={{ base: 'sm', md: 'md' }}>
        <Paper p={{ base: 'md', md: 'lg' }} radius="lg" shadow="md" withBorder>
          <Stack align="center" gap="sm">
            <Title order={2} lh={1.2}>
              Data Program Desa Anti Korupsi
            </Title>
            <Text c="dimmed" ta="center" fz={{ base: 'xs', md: 'sm' }} lh={1.5}>
              Belum ada data program yang tersedia
            </Text>
          </Stack>
        </Paper>
      </Box>
    );
  }

  return (
    <Box>
      <Stack gap={'md'}>
        <Paper p={{ base: 'md', md: 'lg' }} radius="lg" shadow="md" withBorder>
          <Group justify="space-between" mb={{ base: 'sm', md: 'md' }}>
            <Title order={4} lh={1.2}>
              Daftar Program Desa Anti Korupsi
            </Title>
            <Button
              leftSection={<IconPlus size={18} />}
              color="blue"
              variant="light"
              onClick={() =>
                router.push('/admin/landing-page/desa-anti-korupsi/list-desa-anti-korupsi/create')
              }
            >
              Tambah Baru
            </Button>
          </Group>

          {/* Desktop Table */}
          <Box visibleFrom="md">
            <Table
              striped
              highlightOnHover
              withRowBorders
              verticalSpacing="sm"
            >
              <TableThead>
                <TableTr>
                  <TableTh w="50%">Nama Program</TableTh>
                  <TableTh w="30%">Kategori</TableTh>
                  <TableTh w="20%" ta="center">
                    Aksi
                  </TableTh>
                </TableTr>
              </TableThead>
              <TableTbody>
                {filteredData.length > 0 ? (
                  filteredData.map((item) => (
                    <TableTr key={item.id}>
                      <TableTd w="50%">
                        <Text fw={500} lineClamp={1} fz="md" lh={1.5}>
                          {item.name || '-'}
                        </Text>
                      </TableTd>
                      <TableTd w="30%">
                        <Text fz="sm" c="dimmed" lineClamp={1} lh={1.5}>
                          {item.kategori?.name || '-'}
                        </Text>
                      </TableTd>
                      <TableTd w="20%" ta="center">
                        <Button
                          size="xs"
                          radius="md"
                          variant="light"
                          color="blue"
                          leftSection={<IconDeviceImacCog size={16} />}
                          onClick={() =>
                            router.push(
                              `/admin/landing-page/desa-anti-korupsi/list-desa-anti-korupsi/${item.id}`
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
                    <TableTd colSpan={3}>
                      <Text ta="center" c="dimmed" fz="sm" lh={1.5}>
                        Tidak ditemukan data dengan kata kunci pencarian
                      </Text>
                    </TableTd>
                  </TableTr>
                )}
              </TableTbody>
            </Table>
          </Box>

          {/* Mobile Cards */}
          <Box hiddenFrom="md">
            <Stack gap="xs">
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <Paper key={item.id} p="sm" radius="md" withBorder shadow="xs">
                    <Stack gap="xs">
                      <Box>
                        <Text fz="sm" fw={600} lh={1.4}>Nama Program</Text>
                        <Text fw={500} fz="sm" lh={1.5} lineClamp={1}>
                        {item.name || '-'}
                      </Text>
                      </Box>
                      <Box>
                        <Text fz="sm" fw={600} lh={1.4}>Kategori</Text>
                        <Text fz="xs" c="dimmed" lh={1.5} lineClamp={1}>
                        {item.kategori?.name || '-'}
                      </Text>
                      </Box>
                      <Group justify="flex-end">
                        <Button
                          size="xs"
                          radius="md"
                          variant="light"
                          color="blue"
                          leftSection={<IconDeviceImacCog size={16} />}
                          onClick={() =>
                            router.push(
                              `/admin/landing-page/desa-anti-korupsi/list-desa-anti-korupsi/${item.id}`
                            )
                          }
                        >
                          Detail
                        </Button>
                      </Group>
                    </Stack>
                  </Paper>
                ))
              ) : (
                <Paper p="sm" radius="md" withBorder>
                  <Text ta="center" c="dimmed" fz="xs" lh={1.5}>
                    Tidak ditemukan data dengan kata kunci pencarian
                  </Text>
                </Paper>
              )}
            </Stack>
          </Box>
        </Paper>

        <Center>
          <Pagination
            value={page}
            total={totalPages}
            onChange={(newPage) => {
              load(newPage, 10, search);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            size="md"
            radius="md"
          />
        </Center>
      </Stack>
    </Box>
  );
}

export default DesaAntiKorupsi;