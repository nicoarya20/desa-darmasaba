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
import { useDebouncedValue, useShallowEffect } from '@mantine/hooks';
import { IconDeviceImac, IconPlus, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import infoSekolahPaud from '../../../_state/pendidikan/info-sekolah-paud';

function Lembaga() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      <HeaderSearch
        title='Lembaga'
        placeholder='Cari nama lembaga atau jenjang pendidikan...'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListLembaga search={search} />
    </Box>
  );
}

function ListLembaga({ search }: { search: string }) {
  const stateList = useProxy(infoSekolahPaud.lembagaPendidikan);
  const router = useRouter();
  const [debouncedSearch] = useDebouncedValue(search, 1000);

  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = stateList.findMany;

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
      <Paper withBorder bg={colors['white-1']} p={{ base: 'sm', md: 'lg' }} shadow="md" radius="md">
        <Group justify="space-between" mb={{ base: 'sm', md: 'md' }}>
          <Title order={4} lh={1.2}>
            Daftar Lembaga
          </Title>
          <Button
            leftSection={<IconPlus size={18} />}
            color="blue"
            variant="light"
            onClick={() =>
              router.push('/admin/pendidikan/info-sekolah/lembaga/create')
            }
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
                <TableTh style={{ width: '40%' }}>
                  <Text fz="sm" fw={600} lh={1.4} ta="left">
                    Nama Lembaga
                  </Text>
                </TableTh>
                <TableTh style={{ width: '30%' }}>
                  <Text fz="sm" fw={600} lh={1.4} ta="left">
                    Jenjang Pendidikan
                  </Text>
                </TableTh>
                <TableTh style={{ width: '15%' }}>
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
                      <Text fz="md" fw={500} lh={1.5} truncate="end">
                        {item.nama}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Text fz="sm" fw={500} lh={1.5} c="gray.7">
                        {item.jenjangPendidikan?.nama || '-'}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Button
                        variant="light"
                        color="blue"
                        onClick={() =>
                          router.push(
                            `/admin/pendidikan/info-sekolah/lembaga/${item.id}`
                          )
                        }
                      >
                        <IconDeviceImac size={20} />
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
                    <Center py={{ base: 20, md: 24 }}>
                      <Text c="gray.6" fz="sm" lh={1.5}>
                        Tidak ada data lembaga yang cocok
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
                <Paper key={item.id} p="sm" withBorder bg="white">
                  <Stack gap={"xs"}>
                    <Box>
                      <Text fz="sm" fw={600} lh={1.4} c="gray.7">
                        Nama Lembaga
                      </Text>
                      <Text fz="sm" fw={500} lh={1.4}>
                        {item.nama}
                      </Text>
                    </Box>
                    <Box>
                      <Text fz="sm" fw={600} lh={1.4} c="gray.7">
                        Jenjang Pendidikan
                      </Text>
                      <Text fz="sm" fw={500} lh={1.4} c="gray.7">
                        {item.jenjangPendidikan?.nama || '-'}
                      </Text>
                    </Box>
                    <Box>
                      <Button
                        fullWidth
                        variant="light"
                        color="blue"
                        onClick={() =>
                          router.push(
                            `/admin/pendidikan/info-sekolah/lembaga/${item.id}`
                          )
                        }
                      >
                        <IconDeviceImac size={18} />
                        <Text ml={6} fz="sm" fw={500} lh={1.4}>
                          Detail
                        </Text>
                      </Button>
                    </Box>
                  </Stack>
                </Paper>
              ))
            ) : (
              <Center py={20}>
                <Text c="gray.6" fz="sm" lh={1.5}>
                  Tidak ada data lembaga yang cocok
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

export default Lembaga;