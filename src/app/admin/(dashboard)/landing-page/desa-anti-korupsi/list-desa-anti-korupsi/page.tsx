'use client'

import { Box, Button, Center, Group, Pagination, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text, Title, Tooltip } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
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

  useShallowEffect(() => {
    load(page, 10, search);
  }, [page, search]);

  const filteredData = data || [];

  if (loading || !data) {
    return (
      <Stack py="md">
        <Skeleton height={650} radius="lg" />
      </Stack>
    );
  }

  if (data.length === 0) {
    return (
      <Box py="md">
        <Paper p="lg" radius="lg" shadow="md" withBorder>
          <Stack align="center" gap="sm">
            <Title order={4}>Data Program Desa Anti Korupsi</Title>
            <Text c="dimmed" ta="center">
              Belum ada data program yang tersedia
            </Text>
          </Stack>
        </Paper>
      </Box>
    );
  }

  return (
    <Box>
      <Stack gap="md">
        <Paper p="lg" radius="lg" shadow="md" withBorder>
          <Group justify="space-between" mb="md">
            <Title order={4}>Daftar Program Desa Anti Korupsi</Title>
            <Tooltip label="Tambah Program Baru" withArrow>
              <Button leftSection={<IconPlus size={18} />} color="blue" variant="light"
                onClick={() => router.push('/admin/landing-page/desa-anti-korupsi/list-desa-anti-korupsi/create')}
              >
                Tambah Baru
              </Button>
            </Tooltip>
          </Group>
          <Box style={{ overflowX: 'auto' }}>
            <Table
              striped
              highlightOnHover

              withRowBorders
              verticalSpacing="sm"
            >
              <TableThead>
                <TableTr>
                  <TableTh style={{ width: '50%' }}>Nama Program</TableTh>
                  <TableTh style={{ width: '30%' }}>Kategori</TableTh>
                  <TableTh style={{ width: '20%', textAlign: 'center' }}>Aksi</TableTh>
                </TableTr>
              </TableThead>
              <TableTbody>
                {filteredData.length > 0 ? (
                  filteredData.map((item) => (
                    <TableTr key={item.id}>
                      <TableTd style={{ width: '50%' }}>
                        <Text fw={500} lineClamp={1}>
                          {item.name || '-'}
                        </Text>
                      </TableTd>
                      <TableTd style={{ width: '30%' }}>
                        <Text fz="sm" c="dimmed">
                          {item.kategori?.name || '-'}
                        </Text>
                      </TableTd>
                      <TableTd style={{ width: '20%', textAlign: 'center' }}>
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
                      <Text ta="center" c="dimmed">
                        Tidak ditemukan data dengan kata kunci pencarian
                      </Text>
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
            total={totalPages}
            onChange={(newPage) => {
              load(newPage, 10, search);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            size="md"
            radius="md"
            mt="md"
          />
        </Center>
      </Stack>
    </Box>
  );
}

export default DesaAntiKorupsi;
