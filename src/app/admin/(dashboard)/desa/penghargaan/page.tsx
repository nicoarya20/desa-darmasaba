/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import penghargaanState from '@/app/admin/(dashboard)/_state/desa/penghargaan';
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
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../_com/header';

function Penghargaan() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      <HeaderSearch
        title="Penghargaan"
        placeholder="Cari nama atau deskripsi..."
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListPenghargaan search={search} />
    </Box>
  );
}

function ListPenghargaan({ search }: { search: string }) {
  const state = useProxy(penghargaanState);
  const router = useRouter();

  const { data, page, totalPages, loading, load } = state.findMany;

  useEffect(() => {
    load(page, 10, search);
  }, [page, search]);

  const filteredData = data || []

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
      <Paper withBorder bg={colors['white-1']} p="lg" shadow="md" radius="md">
        <Group justify="space-between" mb="md">
          <Title order={4}>List Penghargaan</Title>
          <Tooltip label="Tambah Penghargaan" withArrow>
            <Button
              leftSection={<IconPlus size={18} />}
              color="blue"
              variant="light"
              onClick={() => router.push('/admin/desa/penghargaan/create')}
            >
              Tambah Baru
            </Button>
          </Tooltip>
        </Group>
        <Box style={{ overflowX: 'auto' }}>
          <Table highlightOnHover>
            <TableThead>
              <TableTr>
                <TableTh style={{ width: '35%' }}>Nama</TableTh>
                <TableTh style={{ width: '35%' }}>Deskripsi</TableTh>
                <TableTh style={{ width: '30%' }}>Aksi</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>
                      <Box w={200}>
                        <Text fw={500} truncate="end" lineClamp={1}>
                          {item.name}
                        </Text>
                      </Box>
                    </TableTd>
                    <TableTd>
                      <Box w={200}>
                        <Text
                          truncate="end"
                          lineClamp={1}
                          fz="sm"
                          c="dimmed"
                          dangerouslySetInnerHTML={{ __html: item.deskripsi }}
                        />
                      </Box>
                    </TableTd>
                    <TableTd>
                      <Button
                        variant="light"
                        color="blue"
                        onClick={() =>
                          router.push(`/admin/desa/penghargaan/${item.id}`)
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
                  <TableTd colSpan={4}>
                    <Center py={20}>
                      <Text color="dimmed">
                        Tidak ada data penghargaan yang cocok
                      </Text>
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

export default Penghargaan;
