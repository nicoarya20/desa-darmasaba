'use client'
import colors from '@/con/colors';
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
        title='List Desa Anti Korupsi'
        placeholder='Cari nama program atau kategori...'
        searchIcon={<IconSearch size={20} />}
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
      <Paper bg={colors['white-1']} p={'lg'} shadow="md" radius="md">
        <Group justify="space-between" mb="md">
          <Title order={4}>Daftar Program Desa Anti Korupsi</Title>
          <Tooltip label="Tambah Program Desa Anti Korupsi" withArrow>
          <Button
            leftSection={<IconPlus size={18} />}
            color="blue"
            variant="light"
            onClick={() => router.push('/admin/landing-page/desa-anti-korupsi/list-desa-anti-korupsi/create')}
          >
            Tambah Baru
          </Button>
          </Tooltip>
        </Group>
        <Box style={{ overflowX: "auto" }}>
          <Table highlightOnHover>
            <TableThead>
              <TableTr>
                <TableTh>Nama Program</TableTh>
                <TableTh>Kategori</TableTh>
                <TableTh>Aksi</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>
                      <Box w={350}>
                        <Text lineClamp={1} fw={500}>{item.name || '-'}</Text>
                      </Box>
                    </TableTd>
                    <TableTd>
                      <Text fz="sm" c="dimmed">
                        {item.kategori?.name || '-'}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Button
                        variant="light"
                        color="blue"
                        onClick={() => router.push(`/admin/landing-page/desa-anti-korupsi/list-desa-anti-korupsi/${item.id}`)}
                      >
                        <IconDeviceImacCog size={20} />
                        <Text ml={5}>Detail</Text>
                      </Button>
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={4}>
                    <Center py={20}>
                      <Text c="dimmed">Tidak ada data program yang cocok</Text>
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

export default DesaAntiKorupsi;
