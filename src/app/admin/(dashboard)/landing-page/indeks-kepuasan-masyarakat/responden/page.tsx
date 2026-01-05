'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import { useDebouncedValue, useShallowEffect } from '@mantine/hooks';
import {
  Box,
  Button,
  Center,
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
import { IconDeviceImac, IconSearch } from '@tabler/icons-react';
import HeaderSearch from '../../../_com/header';
import indeksKepuasanState from '../../../_state/landing-page/indeks-kepuasan';

function Responden() {
  const [search, setSearch] = useState('');
  return (
    <Box>
      <HeaderSearch
        title="Data Responden"
        placeholder="Cari nama responden..."
        searchIcon={<IconSearch size={18} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListResponden search={search} />
    </Box>
  );
}

interface ListRespondenProps {
  search: string;
}

function ListResponden({ search }: ListRespondenProps) {
  const state = useProxy(indeksKepuasanState.responden);
  const router = useRouter();
  const [debouncedSearch] = useDebouncedValue(search, 1000); // 500ms delay
  const { data, page, totalPages, loading, load } = state.findMany;

  useShallowEffect(() => {
    load(page, 10, debouncedSearch);
  }, [page, debouncedSearch]);

  const filteredData = data || [];

  if (loading || !data) {
    return (
      <Stack py={{ base: 'md', md: 'lg' }}>
        <Skeleton height={650} radius="lg" />
      </Stack>
    );
  }

  if (data.length === 0) {
    return (
      <Box py={{ base: 'md', md: 'lg' }}>
        <Paper p={{ base: 'md', md: 'lg' }} radius="lg" shadow="md" withBorder>
          <Stack align="center" gap="sm">
            <Title order={2} lh={1.2}>
              Data Responden
            </Title>
            <Text c="dimmed" ta="center" fz={{ base: 'sm', md: 'md' }} lh={1.5}>
              Belum ada data responden yang tersedia
            </Text>
          </Stack>
        </Paper>
      </Box>
    );
  }

  return (
    <Box>
      <Stack gap={'lg'}>
        {/* Desktop Table */}
        <Box visibleFrom="md">
          <Paper p="lg" radius="lg" shadow="md" withBorder>
            <Title order={4} size="lg" mb="md" lh={1.2}>
              Daftar Responden
            </Title>
            <Table
              striped
              highlightOnHover
              withRowBorders
              verticalSpacing="sm"
            >
              <TableThead>
                <TableTr>
                  <TableTh fz="sm" fw={600} w={60}>No</TableTh>
                  <TableTh fz="sm" fw={600}>Nama</TableTh>
                  <TableTh fz="sm" fw={600}>Tanggal</TableTh>
                  <TableTh fz="sm" fw={600}>Jenis Kelamin</TableTh>
                  <TableTh fz="sm" fw={600} w={120}>Aksi</TableTh>
                </TableTr>
              </TableThead>
              <TableTbody>
                {filteredData.length === 0 ? (
                  <TableTr>
                    <TableTd colSpan={5}>
                      <Text ta="center" c="dimmed" fz="sm" lh={1.5}>
                        Tidak ditemukan data dengan kata kunci pencarian
                      </Text>
                    </TableTd>
                  </TableTr>
                ) : (
                  filteredData.map((item, index) => (
                    <TableTr key={item.id}>
                      <TableTd fz="md" lh={1.5}>{index + 1}</TableTd>
                      <TableTd fz="md" lh={1.5}>{item.name}</TableTd>
                      <TableTd fz="md" lh={1.5}>
                        {item.tanggal
                          ? new Date(item.tanggal).toLocaleDateString('id-ID', {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric',
                            })
                          : '-'}
                      </TableTd>
                      <TableTd fz="md" lh={1.5}>{item.jenisKelamin.name}</TableTd>
                      <TableTd>
                        <Button
                          size="xs"
                          radius="md"
                          variant="light"
                          color="blue"
                          leftSection={<IconDeviceImac size={16} />}
                          onClick={() =>
                            router.push(
                              `/admin/landing-page/indeks-kepuasan-masyarakat/responden/${item.id}`
                            )
                          }
                        >
                          Detail
                        </Button>
                      </TableTd>
                    </TableTr>
                  ))
                )}
              </TableTbody>
            </Table>
          </Paper>
        </Box>

        {/* Mobile Cards */}
        <Box hiddenFrom="md">
          <Stack gap="sm">
            <Title order={4} size="md" lh={1.2} px="md">
              Daftar Responden
            </Title>
            {filteredData.length === 0 ? (
              <Paper p="md" radius="lg" shadow="sm" mx="md">
                <Text ta="center" c="dimmed" fz="sm" lh={1.5}>
                  Tidak ditemukan data dengan kata kunci pencarian
                </Text>
              </Paper>
            ) : (
              filteredData.map((item) => (
                <Paper key={item.id} p="md" radius="lg" shadow="sm" mx="md">
                  <Stack gap={'xs'}>
                    <Text fz="sm" c="dimmed" lh={1.4}>Nama</Text>
                    <Text fz="md" lh={1.5}>{item.name}</Text>

                    <Text fz="sm" c="dimmed" lh={1.4}>Tanggal</Text>
                    <Text fz="md" lh={1.5}>
                      {item.tanggal
                        ? new Date(item.tanggal).toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                          })
                        : '-'}
                    </Text>

                    <Text fz="sm" c="dimmed" lh={1.4}>Jenis Kelamin</Text>
                    <Text fz="md" lh={1.5}>{item.jenisKelamin.name}</Text>

                    <Button
                      size="xs"
                      radius="md"
                      variant="light"
                      color="blue"
                      leftSection={<IconDeviceImac size={16} />}
                      onClick={() =>
                        router.push(
                          `/admin/landing-page/indeks-kepuasan-masyarakat/responden/${item.id}`
                        )
                      }
                      mt="xs"
                    >
                      Detail
                    </Button>
                  </Stack>
                </Paper>
              ))
            )}
          </Stack>
        </Box>

        <Center>
          <Pagination
            value={page}
            total={totalPages}
            onChange={(newPage) => {
              load(newPage, 10);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            size="md"
            radius="md"
            mt={{ base: 'md', md: 'lg' }}
          />
        </Center>
      </Stack>
    </Box>
  );
}

export default Responden;