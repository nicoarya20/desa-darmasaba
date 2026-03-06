/* eslint-disable react-hooks/exhaustive-deps */
'use client';
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
import { IconDeviceImacCog, IconPlus, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import infoSekolahPaud from '../../../_state/pendidikan/info-sekolah-paud';
import { useDebouncedValue } from '@mantine/hooks';

function Siswa() {
  const [search, setSearch] = useState('');
  return (
    <Box>
      <HeaderSearch
        title='Siswa'
        placeholder='Cari nama siswa atau lembaga...'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListSiswa search={search} />
    </Box>
  );
}

function ListSiswa({ search }: { search: string }) {
  const stateSiswa = useProxy(infoSekolahPaud.siswa);
  const router = useRouter();
  const [debouncedSearch] = useDebouncedValue(search, 1000);

  const { data, page, totalPages, loading, load } = stateSiswa.findMany;

  useEffect(() => {
    load(page, 10, debouncedSearch);
  }, [page, debouncedSearch]);

  const filteredData = data || [];

  if (loading || !data) {
    return (
      <Stack py={{ base: 'sm', md: 'md' }}>
        <Skeleton height={500} radius="md" />
      </Stack>
    );
  }

  return (
    <Box py={{ base: 'sm', md: 'md' }}>
      <Paper withBorder bg={colors['white-1']} p={{ base: 'md', md: 'lg' }} shadow="md" radius="md">
        <Group justify="space-between" mb={{ base: 'sm', md: 'md' }}>
          <Title order={4} lh={1.2}>
            Daftar Siswa
          </Title>
          <Button
            leftSection={<IconPlus size={18} />}
            color="blue"
            variant="light"
            onClick={() => router.push('/admin/pendidikan/info-sekolah/siswa/create')}
          >
            Tambah Baru
          </Button>
        </Group>

        {/* Desktop Table */}
       <Box visibleFrom="md" style={{ overflowX: 'auto' }}>
          <Table
            highlightOnHover
            miw={0}
            striped
            withRowBorders
            style={{
              tableLayout: 'fixed',
              width: '100%',
            }}
          >
            <TableThead>
              <TableTr>
                <TableTh style={{ width: '35%' }}>
                  <Text fz="sm" fw={600} lh={1.4}>
                    Nama Siswa
                  </Text>
                </TableTh>
                <TableTh style={{ width: '35%' }}>
                  <Text fz="sm" fw={600} lh={1.4}>
                    Lembaga
                  </Text>
                </TableTh>
                <TableTh style={{ width: '20%' }}>
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
                      <Text fz="md" fw={500} lh={1.5} truncate="end">
                        {item.lembaga.nama}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Button
                        variant="light"
                        color="blue"
                        onClick={() =>
                          router.push(`/admin/pendidikan/info-sekolah/siswa/${item.id}`)
                        }
                      >
                        <IconDeviceImacCog size={20} />
                        <Text ml={5} fz="sm" fw={500} lh={1.4}>
                          Detail
                        </Text>
                      </Button>
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={3}>
                    <Center py={{ base: 'sm', md: 'md' }}>
                      <Text c="dimmed" fz="sm" lh={1.4}>
                        Tidak ada data siswa yang cocok
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
          <Stack gap="xs">
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <Paper key={item.id} withBorder p="sm" radius="md">
                  <Stack gap={"xs"}>
                    <Box>
                      <Text fz="sm" fw={600} lh={1.4}>
                        Nama Siswa
                      </Text>
                      <Text fz="sm" fw={500} lh={1.4}>
                        {item.nama}
                      </Text>
                    </Box>
                    <Box>
                      <Text fz="sm" fw={600} lh={1.4}>
                        Lembaga
                      </Text>
                      <Text fz="sm" fw={500} lh={1.4}>
                        {item.lembaga.nama}
                      </Text>
                    </Box>
                    <Box>
                      <Button
                        fullWidth
                        variant="light"
                        color="blue"
                        onClick={() =>
                          router.push(`/admin/pendidikan/info-sekolah/siswa/${item.id}`)
                        }
                      >
                        <IconDeviceImacCog size={20} />
                        <Text ml={5} fz="sm" fw={500} lh={1.4}>
                          Detail
                        </Text>
                      </Button>
                    </Box>
                  </Stack>
                </Paper>
              ))
            ) : (
              <Center py="sm">
                <Text c="dimmed" fz="sm" lh={1.4}>
                  Tidak ada data siswa yang cocok
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
            mt={{ base: 'sm', md: 'md' }}
            mb={{ base: 'sm', md: 'md' }}
            color="blue"
            radius="md"
          />
        </Center>
    </Box>
  );
}

export default Siswa;