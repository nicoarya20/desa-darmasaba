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
  Title,
} from '@mantine/core';
import { IconDeviceImacCog, IconPlus, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import perpustakaanDigitalState from '../../../_state/pendidikan/perpustakaan-digital';
import { useDebouncedValue } from '@mantine/hooks';

function DataPerpustakaan() {
  const [search, setSearch] = useState('');
  return (
    <Box>
      <HeaderSearch
        title='Data Perpustakaan'
        placeholder='Cari judul, deskripsi, atau kategori...'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListDataPerpustakaan search={search} />
    </Box>
  );
}

function ListDataPerpustakaan({ search }: { search: string }) {
  const listDataState = useProxy(perpustakaanDigitalState.dataPerpustakaan);
  const router = useRouter();
  const [debouncedSearch] = useDebouncedValue(search, 1000);

  const { data, page, totalPages, loading, load } = listDataState.findMany;

  useEffect(() => {
    load(page, 10, debouncedSearch);
  }, [page, debouncedSearch]);

  const filteredData = data || [];

  if (loading || !data) {
    return (
      <Stack py="md">
        <Skeleton height={500} radius="md" />
      </Stack>
    );
  }

  return (
    <Box py="md">
      <Paper withBorder bg={colors['white-1']} p="md" shadow="md" radius="md">
        <Group justify="space-between" mb="md">
          <Title order={4} size="md" lh={1.2}>
            List Data Perpustakaan
          </Title>
          <Button
            leftSection={<IconPlus size={18} />}
            color="blue"
            variant="light"
            onClick={() =>
              router.push(
                '/admin/pendidikan/perpustakaan-digital/data-perpustakaan/create'
              )
            }
          >
            Tambah Baru
          </Button>
        </Group>

        {/* Desktop Table */}
       <Box visibleFrom="md" style={{ overflowX: 'auto' }}>
          <Table
            striped
            highlightOnHover
            withRowBorders
            miw={0}
            style={{ tableLayout: 'fixed', width: '100%' }}
          >
            <TableThead>
              <TableTr>
                <TableTh style={{ width: '5%' }}>
                  <Text fz="xs" fw={600} lh={1.4} ta="center">
                    No
                  </Text>
                </TableTh>
                <TableTh style={{ width: '25%' }}>
                  <Text fz="xs" fw={600} lh={1.4}>
                    Judul
                  </Text>
                </TableTh>
                <TableTh style={{ width: '25%' }}>
                  <Text fz="xs" fw={600} lh={1.4}>
                    Kategori
                  </Text>
                </TableTh>
                <TableTh style={{ width: '23%' }}>
                  <Text fz="xs" fw={600} lh={1.4}>
                    Deskripsi
                  </Text>
                </TableTh>
                <TableTh style={{ width: '22%' }}>
                  <Text fz="xs" fw={600} lh={1.4}>
                    Detail
                  </Text>
                </TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item, index) => (
                  <TableTr key={item.id}>
                    <TableTd ta="center">
                      <Text fz="sm" lh={1.5} truncate>
                        {index + 1}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Text fz="sm" lh={1.5} truncate>
                        {item.judul}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Text fz="sm" lh={1.5} truncate>
                        {item.kategori.name}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Text
                        dangerouslySetInnerHTML={{ __html: item.deskripsi }}
                        lineClamp={1}
                        fz="sm"
                        lh={1.5}
                        truncate
                      />
                    </TableTd>
                    <TableTd>
                      <Button
                        variant="light"
                        color="blue"
                        onClick={() =>
                          router.push(
                            `/admin/pendidikan/perpustakaan-digital/data-perpustakaan/${item.id}`
                          )
                        }
                      >
                        <IconDeviceImacCog size={20} />
                        <Text ml={5} fz="sm" fw={500}>
                          Detail
                        </Text>
                      </Button>
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={5}>
                    <Center py="xl">
                      <Text c="dimmed" fz="sm" lh={1.5}>
                        Tidak ada data perpustakaan yang cocok
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
              filteredData.map((item, index) => (
                <Paper key={item.id} withBorder p="sm" radius="md">
                  <Stack gap={"xs"}>
                    <Box>
                      <Text fz="xs" fw={600} lh={1.4}>
                        No
                      </Text>
                      <Text fz="sm" fw={500} lh={1.4}>
                        {index + 1}
                      </Text>
                    </Box>
                    <Box>
                      <Text fz="xs" fw={600} lh={1.4}>
                        Judul
                      </Text>
                      <Text fz="sm" fw={500} lh={1.4} truncate>
                        {item.judul}
                      </Text>
                    </Box>
                    <Box>
                      <Text fz="xs" fw={600} lh={1.4}>
                        Kategori
                      </Text>
                      <Text fz="sm" fw={500} lh={1.4} truncate>
                        {item.kategori.name}
                      </Text>
                    </Box>
                    <Box>
                      <Text fz="xs" fw={600} lh={1.4}>
                        Deskripsi
                      </Text>
                      <Text
                        dangerouslySetInnerHTML={{ __html: item.deskripsi }}
                        fz="sm"
                        fw={500}
                        lh={1.4}
                        lineClamp={2}
                      />
                    </Box>
                    <Box>
                      <Button
                        variant="light"
                        color="blue"
                        fullWidth
                        onClick={() =>
                          router.push(
                            `/admin/pendidikan/perpustakaan-digital/data-perpustakaan/${item.id}`
                          )
                        }
                      >
                        <IconDeviceImacCog size={20} />
                        <Text ml={5} fz="sm" fw={500}>
                          Detail
                        </Text>
                      </Button>
                    </Box>
                  </Stack>
                </Paper>
              ))
            ) : (
              <Center py="xl">
                <Text c="dimmed" fz="sm" lh={1.5}>
                  Tidak ada data perpustakaan yang cocok
                </Text>
              </Center>
            )}
          </Stack>
        </Box>

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
      </Paper>
    </Box>
  );
}

export default DataPerpustakaan;