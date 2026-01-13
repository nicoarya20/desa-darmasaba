/* eslint-disable react-hooks/exhaustive-deps */
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
import { useDebouncedValue } from '@mantine/hooks';
import { IconDeviceImacCog, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import beasiswaDesaState from '../../../_state/pendidikan/beasiswa-desa';

function BeasiswaPendaftar() {
  const [search, setSearch] = useState('');
  return (
    <Box>
      <HeaderSearch
        title='Beasiswa Pendaftar'
        placeholder='Cari nama, alamat, atau data lain...'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListBeasiswaPendaftar search={search} />
    </Box>
  );
}

function ListBeasiswaPendaftar({ search }: { search: string }) {
  const state = useProxy(beasiswaDesaState.beasiswaPendaftar);
  const router = useRouter();
  const [debouncedSearch] = useDebouncedValue(search, 1000);

  const { data, page, totalPages, loading, load } = state.findMany;

  useEffect(() => {
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
            Daftar Beasiswa Pendaftar
          </Title>
        </Group>

        {/* Desktop: Table */}
       <Box visibleFrom="md" style={{ overflowX: 'auto' }}>
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
                <TableTh w="5%">No</TableTh>
                <TableTh w="25%">Nama Lengkap</TableTh>
                <TableTh w="30%">Alamat</TableTh>
                <TableTh w="15%">Tanggal Lahir</TableTh>
                <TableTh w="15%">Jenis Kelamin</TableTh>
                <TableTh w="10%">Aksi</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item, index) => (
                  <TableTr key={item.id}>
                    <TableTd>
                      <Text fz="md" fw={500} lh={1.45}>
                        {index + 1}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Text truncate fz="md" fw={500} lh={1.45}>
                        {item.namaLengkap}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Text truncate fz="md" fw={500} lh={1.45}>
                        {item.alamatKTP}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Text truncate fz="md" fw={500} lh={1.45}>
                        {item.tanggalLahir ? new Date(item.tanggalLahir).toLocaleDateString() : '-'}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Text truncate fz="md" fw={500} lh={1.45}>
                        {item.jenisKelamin}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Button
                        variant="light"
                        color="blue"
                        onClick={() =>
                          router.push(`/admin/pendidikan/beasiswa-desa/beasiswa-pendaftar/${item.id}`)
                        }
                        fz="sm"
                        fw={500}
                        lh={1.4}
                      >
                        <IconDeviceImacCog size={20} />
                        <Text ml={5}>Detail</Text>
                      </Button>
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={6}>
                    <Center py={{ base: 'sm', md: 'md' }}>
                      <Text c="dimmed" fz="sm" lh={1.4}>
                        Tidak ada data pendaftar yang cocok
                      </Text>
                    </Center>
                  </TableTd>
                </TableTr>
              )}
            </TableTbody>
          </Table>
        </Box>

        {/* Mobile: Card */}
        <Box hiddenFrom="md">
          <Stack gap="xs">
            {filteredData.length > 0 ? (
              filteredData.map((item, index) => (
                <Paper key={item.id} withBorder p="sm" radius="sm">
                  <Stack gap={"xs"}>
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
                        Nama Lengkap
                      </Text>
                      <Text fz="sm" fw={500} lh={1.4} truncate>
                        {item.namaLengkap}
                      </Text>
                    </Box>
                    <Box>
                      <Text fz="sm" fw={600} lh={1.4}>
                        Alamat
                      </Text>
                      <Text fz="sm" fw={500} lh={1.4} truncate>
                        {item.alamatKTP}
                      </Text>
                    </Box>
                    <Box>
                      <Text fz="sm" fw={600} lh={1.4}>
                        Tanggal Lahir
                      </Text>
                      <Text fz="sm" fw={500} lh={1.4}>
                        {item.tanggalLahir ? new Date(item.tanggalLahir).toLocaleDateString() : '-'}
                      </Text>
                    </Box>
                    <Box>
                      <Text fz="sm" fw={600} lh={1.4}>
                        Jenis Kelamin
                      </Text>
                      <Text fz="sm" fw={500} lh={1.4}>
                        {item.jenisKelamin}
                      </Text>
                    </Box>
                    <Box>
                      <Button
                        variant="light"
                        color="blue"
                        onClick={() =>
                          router.push(`/admin/pendidikan/beasiswa-desa/beasiswa-pendaftar/${item.id}`)
                        }
                        fullWidth
                        fz="sm"
                        fw={500}
                        lh={1.4}
                      >
                        <IconDeviceImacCog size={20} />
                        <Text ml={5}>Detail</Text>
                      </Button>
                    </Box>
                  </Stack>
                </Paper>
              ))
            ) : (
              <Center py="sm">
                <Text c="dimmed" fz="sm" lh={1.4}>
                  Tidak ada data pendaftar yang cocok
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
            load(newPage, 10, search);
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

export default BeasiswaPendaftar;