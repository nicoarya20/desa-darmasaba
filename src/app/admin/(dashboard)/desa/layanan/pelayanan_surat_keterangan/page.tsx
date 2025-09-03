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
  Tooltip
} from '@mantine/core';
import { IconDeviceImac, IconPlus, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import stateLayananDesa from '../../../_state/desa/layananDesa';

function SuratKeterangan() {
  const [search, setSearch] = useState("");
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

  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = suratKeteranganState.findMany;

  useEffect(() => {
    load(page, 10, search);
  }, [page, search]);

  const filteredData = useMemo(() => {
    if (!data) return [];
    const keyword = search.toLowerCase();
    return data.filter(item =>
      item.name?.toLowerCase().includes(keyword) ||
      item.deskripsi?.toLowerCase().includes(keyword)
    );
  }, [data, search]);

  // Loading state
  if (loading || !data) {
    return (
      <Stack py={10}>
        <Skeleton height={600} radius="md" />
      </Stack>
    );
  }

  return (
    <Box py={10}>
      <Paper withBorder bg={colors['white-1']} p={'lg'} shadow="md" radius="md">
        <Group justify="space-between" mb="md">
          <Title order={4}>List Surat Keterangan</Title>
          <Tooltip label="Tambah Surat Keterangan" withArrow>
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
          </Tooltip>
        </Group>
        <Box style={{ overflowX: "auto" }}>
          <Table highlightOnHover>
            <TableThead>
              <TableTr>
                <TableTh style={{ width: '30%' }}>Nama</TableTh>
                <TableTh style={{ width: '45%' }}>Deskripsi</TableTh>
                <TableTh style={{ width: '15%' }}>Aksi</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd style={{ width: '30%' }}>
                      <Box w={200}>
                        <Text fw={500} truncate="end" lineClamp={1}>
                          {item.name}
                        </Text>
                      </Box>
                    </TableTd>
                    <TableTd style={{ width: '45%' }}>
                      <Box w={200}>
                        <Text truncate="end" lineClamp={1} fz="sm" c="dimmed"
                          dangerouslySetInnerHTML={{ __html: item.deskripsi }}
                        />
                      </Box>
                    </TableTd>
                    <TableTd style={{ width: '15%' }}>
                      <Button
                        variant="light"
                        color="blue"
                        onClick={() =>
                          router.push(`/admin/desa/layanan/pelayanan_surat_keterangan/${item.id}`)
                        }
                      >
                        <IconDeviceImac size={20} />
                        <Text ml={5}>Detail</Text>
                      </Button>
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={3}>
                    <Center py={20}>
                      <Text color="dimmed">Tidak ada data surat keterangan yang cocok</Text>
                    </Center>
                  </TableTd>
                </TableTr>
              )}
            </TableTbody>
          </Table>
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
