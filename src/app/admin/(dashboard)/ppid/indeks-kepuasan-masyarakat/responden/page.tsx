'use client';
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
import { useShallowEffect } from '@mantine/hooks';
import { IconDeviceImacCog, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import indeksKepuasanState from '../../../_state/landing-page/indeks-kepuasan';

function Responden() {
  const [search, setSearch] = useState('');
  return (
    <Box>
      <HeaderSearch
        title="Responden"
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
  const { data, page, totalPages, loading, load } = state.findMany;

  useShallowEffect(() => {
    load(page, 10);
  }, [page]);

  const filteredData = (data || []).filter((item) => {
    const keyword = search.toLowerCase();
    return item.name.toLowerCase().includes(keyword);
  });

  if (loading || !data) {
    return (
      <Stack py="xl">
        <Skeleton height={750} radius="lg" />
      </Stack>
    );
  }

  if (data.length === 0) {
    return (
      <Paper withBorder bg="white" p={{ base: 'md', sm: 'lg' }} radius="md" shadow="sm">
        <Stack gap="md">
          <Title order={2} lh={1.2}>
            Data Responden
          </Title>
          <Box visibleFrom="md">
            <Table striped withRowBorders>
              <TableThead>
                <TableTr>
                  <TableTh ta="center">No</TableTh>
                  <TableTh>Nama</TableTh>
                  <TableTh>Tanggal</TableTh>
                  <TableTh>Jenis Kelamin</TableTh>
                  <TableTh ta="center">Aksi</TableTh>
                </TableTr>
              </TableThead>
            </Table>
          </Box>
          <Text c="dimmed" ta="center" py="md" fz={{ base: 'sm', md: 'md' }} lh={1.4}>
            Belum ada data responden yang tersedia
          </Text>
        </Stack>
      </Paper>
    );
  }

  return (
    <Paper withBorder bg="white" p={{ base: 'md', sm: 'lg' }} radius="md" shadow="sm">
      <Stack gap="md">
        <Title order={2} lh={1.2}>
          Data Responden
        </Title>

        {/* Desktop Table */}
        <Box visibleFrom="md">
          <Table striped withRowBorders>
            <TableThead>
              <TableTr>
                <TableTh w="5%" ta="center">
                  No
                </TableTh>
                <TableTh w="25%">Nama</TableTh>
                <TableTh w="25%">Tanggal</TableTh>
                <TableTh w="20%">Jenis Kelamin</TableTh>
                <TableTh w="15%" ta="center">
                  Aksi
                </TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length === 0 ? (
                <TableTr>
                  <TableTd colSpan={5}>
                    <Text c="dimmed" ta="center" py="md" fz="sm" lh={1.4}>
                      Tidak ada data yang cocok dengan pencarian
                    </Text>
                  </TableTd>
                </TableTr>
              ) : (
                filteredData.map((item, index) => (
                  <TableTr key={item.id}>
                    <TableTd ta="center">{index + 1}</TableTd>
                    <TableTd>{item.name}</TableTd>
                    <TableTd>
                      {item.tanggal ? new Date(item.tanggal).toLocaleDateString('id-ID') : '-'}
                    </TableTd>
                    <TableTd>{item.jenisKelamin.name}</TableTd>
                    <TableTd ta="center">
                      <Button
                        size="xs"
                        radius="md"
                        variant="light"
                        color="blue"
                        leftSection={<IconDeviceImacCog size={16} />}
                        onClick={() =>
                          router.push(`/admin/ppid/ikm-desa-darmasaba/responden/${item.id}`)
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
        </Box>

        {/* Mobile Card View */}
        <Box hiddenFrom="md">
          {filteredData.length === 0 ? (
            <Text c="dimmed" ta="center" py="md" fz="sm" lh={1.4}>
              Tidak ada data yang cocok dengan pencarian
            </Text>
          ) : (
            <Stack gap="sm">
              {filteredData.map((item, index) => (
                <Paper key={item.id} withBorder p="sm" radius="md">
                  <Stack gap={4}>
                    <Box>
                      <Text fz="sm" fw={600} lh={1.4}>
                        No
                      </Text>
                      <Text fz="sm" fw={500} lh={1.4}>
                        {index + 1}
                      </Text>
                    </Box>
                    <Box>
                      <Text fz="sm" fw={600} lh={1.4}>
                        Nama
                      </Text>
                      <Text fz="sm" fw={500} lh={1.4}>
                        {item.name}
                      </Text>
                    </Box>
                    <Box>
                      <Text fz="sm" fw={600} lh={1.4}>
                        Tanggal
                      </Text>
                      <Text fz="sm" fw={500} lh={1.4}>
                        {item.tanggal
                          ? new Date(item.tanggal).toLocaleDateString('id-ID')
                          : '-'}
                      </Text>
                    </Box>
                    <Box>
                      <Text fz="sm" fw={600} lh={1.4}>
                        Jenis Kelamin
                      </Text>
                      <Text fz="sm" fw={500} lh={1.4}>
                        {item.jenisKelamin.name}
                      </Text>
                    </Box>
                    <Box ta="center">
                      <Button
                        size="xs"
                        radius="md"
                        variant="light"
                        color="blue"
                        leftSection={<IconDeviceImacCog size={16} />}
                        onClick={() =>
                          router.push(`/admin/ppid/ikm-desa-darmasaba/responden/${item.id}`)
                        }
                      >
                        Detail
                      </Button>
                    </Box>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          )}
        </Box>

        {filteredData.length > 0 && (
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
            />
          </Center>
        )}
      </Stack>
    </Paper>
  );
}

export default Responden;