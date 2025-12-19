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
import HeaderSearch from '../../_com/header';
import puskesmasState from '../../_state/kesehatan/puskesmas/puskesmas';

function Puskesmas() {
  const [search, setSearch] = useState("");

  return (
    <Box>
      {/* Header dengan Search */}
      <HeaderSearch
        title='Puskesmas'
        placeholder='Cari nama atau alamat...'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />

      <ListPuskesmas search={search} />
    </Box>
  );
}

function ListPuskesmas({ search }: { search: string }) {
  const statePuskesmas = useProxy(puskesmasState);
  const router = useRouter();
  const [debouncedSearch] = useDebouncedValue(search, 1000);

  const { data, page, totalPages, loading, load } = statePuskesmas.findMany;

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
          <Title order={4}>Daftar Puskesmas</Title>
          <Button
            leftSection={<IconPlus size={18} />}
            color="blue"
            variant="light"
            onClick={() => router.push('/admin/kesehatan/puskesmas/create')}
          >
            Tambah Baru
          </Button>
        </Group>

        {/* Desktop Table */}
        <Box visibleFrom="md">
          <Table highlightOnHover>
            <TableThead>
              <TableTr>
                <TableTh>
                  <Text fz="sm" fw={600} lh={1.2}>
                    Nama Puskesmas
                  </Text>
                </TableTh>
                <TableTh>
                  <Text fz="sm" fw={600} lh={1.2}>
                    Alamat
                  </Text>
                </TableTh>
                <TableTh>
                  <Text fz="sm" fw={600} lh={1.2}>
                    Kontak
                  </Text>
                </TableTh>
                <TableTh>
                  <Text fz="sm" fw={600} lh={1.2}>
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
                      <Text fz="md" fw={500} lh={1.5} truncate="end" lineClamp={1}>
                        {item.name}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Text fz="sm" fw={500} lh={1.5} c="dimmed" truncate="end" lineClamp={1}>
                        {item.alamat}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Text fz="sm" fw={500} lh={1.5} c="dimmed" truncate="end" lineClamp={1}>
                        {item.kontak.kontakPuskesmas}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Button
                        variant="light"
                        color="blue"
                        onClick={() => router.push(`/admin/kesehatan/puskesmas/${item.id}`)}
                        radius="md"
                        px="sm"
                        h={34}
                      >
                        <IconDeviceImacCog size={18} />
                        <Text ml="xs" fz="sm" fw={500}>
                          Detail
                        </Text>
                      </Button>
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={4}>
                    <Center py={{ base: 'sm', md: 'md' }}>
                      <Text fz="sm" c="dimmed" ta="center">
                        Tidak ada data puskesmas yang cocok
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
                <Stack gap={'xs'}>
                  <Box>
                    <Text fz="sm" fw={600} lh={1.4}>
                      Nama Puskesmas
                    </Text>
                    <Text fz="sm" fw={500} lh={1.45}>
                      {item.name}
                    </Text>
                  </Box>
                  <Box>
                    <Text fz="sm" fw={600} lh={1.4}>
                      Alamat
                    </Text>
                    <Text fz="sm" fw={500} lh={1.45} c="dimmed">
                      {item.alamat}
                    </Text>
                  </Box>
                  <Box>
                    <Text fz="sm" fw={600} lh={1.4}>
                      Kontak
                    </Text>
                    <Text fz="sm" fw={500} lh={1.45} c="dimmed">
                      {item.kontak.kontakPuskesmas}
                    </Text>
                  </Box>
                  <Button
                    variant="light"
                    color="blue"
                    onClick={() => router.push(`/admin/kesehatan/puskesmas/${item.id}`)}
                    radius="md"
                    fullWidth
                    mt="xs"
                  >
                    <IconDeviceImacCog size={18} />
                    <Text ml="xs" fz="sm" fw={500}>
                      Detail
                    </Text>
                  </Button>
                </Stack>
              </Paper>
            ))
          ) : (
            <Center py="md">
              <Text fz="sm" c="dimmed">
                Tidak ada data puskesmas yang cocok
              </Text>
            </Center>
          )}
        </Stack>
      </Paper>

      {/* Pagination */}
      <Center>
        <Pagination
          value={page}
          onChange={(newPage) => {
            load(newPage, 10, search);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          total={totalPages}
          my="md"
          color="blue"
          radius="md"
        />
      </Center>
    </Box>
  );
}

export default Puskesmas;