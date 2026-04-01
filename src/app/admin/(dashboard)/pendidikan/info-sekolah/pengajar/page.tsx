/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import colors from '@/con/colors';
import {
  Box, Button, Center, Group, Pagination, Paper, Skeleton, Stack,
  Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text, Title
} from '@mantine/core';
import { IconDeviceImacCog, IconPlus, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import infoSekolahPaud from '../../../_state/pendidikan/info-sekolah-paud';
import { useDebouncedValue } from '@mantine/hooks';

function Pengajar() {
  const [search, setSearch] = useState('');
  return (
    <Box>
      <HeaderSearch
        title='Pengajar'
        placeholder='Cari nama pengajar atau lembaga...'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListPengajar search={search} />
    </Box>
  );
}

function ListPengajar({ search }: { search: string }) {
  const listState = useProxy(infoSekolahPaud.pengajar);
  const router = useRouter();
  const [debouncedSearch] = useDebouncedValue(search, 1000);

  const {
    data,
    page,
    totalPages,
    loading,
    load
  } = listState.findMany;

  useEffect(() => {
    load(page, 10, debouncedSearch);
  }, [page, debouncedSearch]);

  const filteredData = data || [];

  if (loading || !data) {
    return (
      <Stack py={{ base: 'sm', md: 'md' }}>
        <Skeleton h={500} radius="md" />
      </Stack>
    );
  }

  return (
    <Box py={{ base: 'sm', md: 'md' }}>
      <Paper withBorder bg={colors['white-1']} p={{ base: 'sm', md: 'lg' }} shadow="md" radius="md">
        <Group justify="space-between" mb={{ base: 'sm', md: 'md' }}>
          <Title order={4} lh={1.2}>
            Daftar Pengajar
          </Title>
          <Button
            leftSection={<IconPlus size={18} />}
            color="blue"
            variant="light"
            onClick={() => router.push('/admin/pendidikan/info-sekolah/pengajar/create')}
          >
            Tambah Baru
          </Button>
        </Group>

        {/* Desktop Table */}
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
                <TableTh style={{ width: '35%' }}>
                  <Text fz="sm" fw={600} lh={1.4} ta="left">
                    Nama Pengajar
                  </Text>
                </TableTh>
                <TableTh style={{ width: '35%' }}>
                  <Text fz="sm" fw={600} lh={1.4} ta="left">
                    Lembaga
                  </Text>
                </TableTh>
                <TableTh style={{ width: '30%' }}>
                  <Text fz="sm" fw={600} lh={1.4} ta="left">
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
                        {item.nama}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Text fz="md" fw={500} lh={1.5} c="gray.7" truncate="end">
                        {item.lembaga.nama}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Button
                        variant="light"
                        color="blue"
                        onClick={() => router.push(`/admin/pendidikan/info-sekolah/pengajar/${item.id}`)}
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
                    <Center py={{ base: 'md', md: 'lg' }}>
                      <Text c="gray.6" fz="sm" lh={1.4}>
                        Tidak ada data pengajar yang cocok
                      </Text>
                    </Center>
                  </TableTd>
                </TableTr>
              )}
            </TableTbody>
          </Table>
        </Box>

        {/* Mobile Card View */}
        <Box hiddenFrom="md">
          <Stack gap="xs">
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <Paper key={item.id} withBorder radius="md" p="sm">
                  <Stack gap={"xs"}>
                    <Box>
                      <Text fz="sm" fw={600} lh={1.4}>
                        Nama Pengajar
                      </Text>
                      <Text fz="sm" fw={500} lh={1.4}>
                        {item.nama}
                      </Text>
                    </Box>
                    <Box>
                      <Text fz="sm" fw={600} lh={1.4}>
                        Lembaga
                      </Text>
                      <Text fz="sm" fw={500} lh={1.4} c="gray.7">
                        {item.lembaga.nama}
                      </Text>
                    </Box>
                    <Box>
                      <Button
                        fullWidth
                        variant="light"
                        color="blue"
                        onClick={() => router.push(`/admin/pendidikan/info-sekolah/pengajar/${item.id}`)}
                      >
                        <IconDeviceImacCog size={18} />
                        <Text ml={5} fz="sm" fw={500} lh={1.4}>
                          Detail
                        </Text>
                      </Button>
                    </Box>
                  </Stack>
                </Paper>
              ))
            ) : (
              <Center py="md">
                <Text c="gray.6" fz="sm" lh={1.4}>
                  Tidak ada data pengajar yang cocok
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

export default Pengajar;