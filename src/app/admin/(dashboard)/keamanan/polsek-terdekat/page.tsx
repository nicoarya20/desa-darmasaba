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
import { IconDeviceImac, IconPlus, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../_com/header';
import polsekTerdekat from '../../_state/keamanan/polsek-terdekat';

function PolsekTerdekat() {
  const [search, setSearch] = useState("");

  return (
    <Box>
      <HeaderSearch
        title='Polsek Terdekat'
        placeholder='Cari nama atau alamat...'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />

      <ListPolsekTerdekat search={search} />
    </Box>
  );
}

function ListPolsekTerdekat({ search }: { search: string }) {
  const polsekState = useProxy(polsekTerdekat);
  const router = useRouter();
  const [debouncedSearch] = useDebouncedValue(search, 1000);

  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = polsekState.findMany;

  useShallowEffect(() => {
    load(page, 10, debouncedSearch);
  }, [page, debouncedSearch]);

  const filteredData = data || [];

  if (loading || !data) {
    return (
      <Stack py={{ base: 'sm', md: 'lg' }}>
        <Skeleton height={600} radius="md" />
      </Stack>
    );
  }

  return (
    <Box py={{ base: 'sm', md: 'lg' }}>
      <Paper withBorder bg={colors['white-1']} p={{ base: 'md', md: 'lg' }} shadow="md" radius="md">
        <Group justify="space-between" mb={{ base: 'md', md: 'lg' }}>
          <Title order={4} lh={{ base: 1.2, md: 1.2 }}>
            Daftar Polsek Terdekat
          </Title>
          <Button
            leftSection={<IconPlus size={18} />}
            color="blue"
            variant="light"
            onClick={() => router.push('/admin/keamanan/polsek-terdekat/create')}
          >
            Tambah Baru
          </Button>
        </Group>

        {/* Desktop Table */}
        <Box visibleFrom="md">
          <Table
            highlightOnHover
            miw={0}
            style={{
              tableLayout: 'fixed',
              width: '100%',
            }}
          >
            <TableThead>
              <TableTr>
                <TableTh style={{ width: '25%' }}>
                  <Text fz="sm" fw={600} lh={1.4}>
                    Nama Polsek
                  </Text>
                </TableTh>
                <TableTh style={{ width: '15%' }}>
                  <Text fz="sm" fw={600} lh={1.4}>
                    Jarak
                  </Text>
                </TableTh>
                <TableTh style={{ width: '25%' }}>
                  <Text fz="sm" fw={600} lh={1.4}>
                    Alamat
                  </Text>
                </TableTh>
                <TableTh style={{ width: '10%' }}>
                  <Text fz="sm" fw={600} lh={1.4}>
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
                      <Text fz="md" fw={500} lh={1.5} truncate="end">
                        {item.nama}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Text fz="md" fw={500} lh={1.5}>
                        {item.jarakKeDesa}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Text fz="md" fw={500} lh={1.5} truncate="end">
                        {item.alamat}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Button
                        variant="light"
                        color="blue"
                        onClick={() => router.push(`/admin/keamanan/polsek-terdekat/${item.id}`)}
                        w="100%"
                      >
                        <IconDeviceImac size={18} />
                        <Text ml={5} fz="sm" fw={500} lh={1.4}>
                          Detail
                        </Text>
                      </Button>
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={4}>
                    <Center py={24}>
                      <Text c="dimmed" fz="sm" lh={1.4}>
                        Tidak ada data Polsek yang cocok
                      </Text>
                    </Center>
                  </TableTd>
                </TableTr>
              )}
            </TableTbody>
          </Table>
        </Box>

        {/* Mobile Cards */}
        <Box hiddenFrom="md">
          <Stack gap="sm">
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <Paper key={item.id} withBorder p="sm" radius="sm">
                  <Stack gap={"xs"}>
                    <Box>
                      <Text fz="sm" fw={600} lh={1.4}>
                        Nama Polsek
                      </Text>
                      <Text fz="sm" fw={500} lh={1.45}>
                        {item.nama}
                      </Text>
                    </Box>
                    <Box>
                      <Text fz="sm" fw={600} lh={1.4}>
                        Jarak
                      </Text>
                      <Text fz="sm" fw={500} lh={1.45}>
                        {item.jarakKeDesa}
                      </Text>
                    </Box>
                    <Box>
                      <Text fz="sm" fw={600} lh={1.4}>
                        Alamat
                      </Text>
                      <Text fz="sm" fw={500} lh={1.45}>
                        {item.alamat}
                      </Text>
                    </Box>
                    <Box>
                      <Button
                        variant="light"
                        color="blue"
                        fullWidth
                        onClick={() => router.push(`/admin/keamanan/polsek-terdekat/${item.id}`)}
                      >
                        <IconDeviceImac size={18} />
                        <Text ml={5} fz="sm" fw={500} lh={1.4}>
                          Detail
                        </Text>
                      </Button>
                    </Box>
                  </Stack>
                </Paper>
              ))
            ) : (
              <Center py={24}>
                <Text c="dimmed" fz="sm" lh={1.4}>
                  Tidak ada data Polsek yang cocok
                </Text>
              </Center>
            )}
          </Stack>
        </Box>
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
          mt={{ base: 'lg', md: 'xl' }}
          mb={{ base: 'lg', md: 'xl' }}
          color="blue"
          radius="md"
        />
      </Center>
    </Box>
  );
}

export default PolsekTerdekat;