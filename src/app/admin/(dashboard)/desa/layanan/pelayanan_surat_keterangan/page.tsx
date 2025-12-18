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
import { useEffect, useMemo, useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import stateLayananDesa from '../../../_state/desa/layananDesa';
import { useDebouncedValue } from '@mantine/hooks';

function SuratKeterangan() {
  const [search, setSearch] = useState('');
  return (
    <Box>
      <HeaderSearch
        title='Pelayanan Surat Keterangan'
        placeholder='Cari nama atau deskripsi...'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListSuratKeterangan search={search} />
    </Box>
  );
}

function ListSuratKeterangan({ search }: { search: string }) {
  const suratKeteranganState = useProxy(stateLayananDesa.suratKeterangan);
  const router = useRouter();
  const [debouncedSearch] = useDebouncedValue(search, 1000);

  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = suratKeteranganState.findMany;

  useEffect(() => {
    load(page, 10, debouncedSearch);
  }, [page, debouncedSearch]);

  const filteredData = useMemo(() => {
    if (!data) return [];
    const keyword = debouncedSearch.toLowerCase();
    return data.filter(
      (item) =>
        item.name?.toLowerCase().includes(keyword) ||
        item.deskripsi?.toLowerCase().includes(keyword)
    );
  }, [data, debouncedSearch]);

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
          <Title order={2} lh={1.2}>
            List Surat Keterangan
          </Title>
          <Button
            leftSection={<IconPlus size={18} />}
            color="blue"
            variant="light"
            onClick={() =>
              router.push('/admin/desa/layanan/pelayanan_surat_keterangan/create')
            }
          >
            Tambah Baru
          </Button>
        </Group>

        {/* Desktop Table */}
        <Box visibleFrom="md">
          <Table highlightOnHover>
            <TableThead>
              <TableTr>
                <TableTh fz="sm" fw={600} ta="left">
                  Nama
                </TableTh>
                <TableTh fz="sm" fw={600} ta="left">
                  Deskripsi
                </TableTh>
                <TableTh fz="sm" fw={600} ta="left">
                  Aksi
                </TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>
                      <Text fz="md" fw={500} lh={1.5} truncate="end">
                        {item.name}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Text
                        fz="sm"
                        lh={1.5}
                        dangerouslySetInnerHTML={{ __html: item.deskripsi || '' }}
                        style={{ wordBreak: 'break-word' }}
                      />
                    </TableTd>
                    <TableTd>
                      <Button
                        size="xs"
                        radius="md"
                        variant="light"
                        color="blue"
                        leftSection={<IconDeviceImacCog size={16} />}
                        onClick={() =>
                          router.push(
                            `/admin/desa/layanan/pelayanan_surat_keterangan/${item.id}`
                          )
                        }
                      >
                        Detail
                      </Button>
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={3}>
                    <Center py="xl">
                      <Text c="dimmed" fz="sm" ta="center">
                        Tidak ada data surat keterangan yang cocok
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
                <Paper key={item.id} withBorder p="sm" radius="md">
                  <Stack gap={4}>
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
                        Deskripsi
                      </Text>
                      <Box pl={8}>
                        <Text
                          fz="sm"
                          fw={500}
                          lh={1.4}
                          dangerouslySetInnerHTML={{ __html: item.deskripsi || '' }}
                          style={{ wordBreak: 'break-word' }}
                        />
                      </Box>
                    </Box>
                    <Box>
                      <Button
                        fullWidth
                        size="xs"
                        radius="md"
                        variant="light"
                        color="blue"
                        leftSection={<IconDeviceImacCog size={16} />}
                        onClick={() =>
                          router.push(
                            `/admin/desa/layanan/pelayanan_surat_keterangan/${item.id}`
                          )
                        }
                      >
                        Detail
                      </Button>
                    </Box>
                  </Stack>
                </Paper>
              ))
            ) : (
              <Center py="xl">
                <Text c="dimmed" fz="sm" ta="center">
                  Tidak ada data surat keterangan yang cocok
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

export default SuratKeterangan;