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
import { useShallowEffect } from '@mantine/hooks';
import { IconDeviceImacCog, IconPlus, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../_com/header';
import pencegahanKriminalitasState from '../../_state/keamanan/pencegahan-kriminalitas';

function PencegahanKriminalitas() {
  const [search, setSearch] = useState("");

  return (
    <Box>
      {/* Header Search */}
      <HeaderSearch
        title='Pencegahan Kriminalitas'
        placeholder='Cari nama, slug, atau deskripsi...'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />

      <ListPencegahanKriminalitas search={search} />
    </Box>
  );
}

function ListPencegahanKriminalitas({ search }: { search: string }) {
  const kriminalitasState = useProxy(pencegahanKriminalitasState)
  const router = useRouter();

  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = kriminalitasState.findMany;

  useShallowEffect(() => {
    load(page, 10, search);
  }, [page, search]);


  if (loading || !data) {
    return (
      <Stack py={10}>
        <Skeleton height={600} radius="md" />
      </Stack>
    )
  }

  return (
    <Box py={10}>
      <Paper withBorder bg={colors['white-1']} p={'lg'} shadow="md" radius="md">
        {/* Judul + Tombol Tambah */}
        <Group justify="space-between" mb="md">
          <Title order={4}>Daftar Pencegahan Kriminalitas</Title>
          <Button
            leftSection={<IconPlus size={18} />}
            color="blue"
            variant="light"
            onClick={() => router.push('/admin/keamanan/pencegahan-kriminalitas/create')}
          >
            Tambah Baru
          </Button>
        </Group>

        {/* Tabel */}
        <Box style={{ overflowX: "auto" }}>
          <Table highlightOnHover>
            <TableThead>
              <TableTr>
                <TableTh>Nama Pencegahan</TableTh>
                <TableTh>Deskripsi</TableTh>
                <TableTh>Deskripsi Singkat</TableTh>
                <TableTh>Aksi</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {data.length > 0 ? (
                data.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>
                      <Box w={200}>
                        <Text fw={500} truncate="end" lineClamp={1}>
                          {item.judul}
                        </Text>
                      </Box>
                    </TableTd>
                    <TableTd>
                      <Box w={200}>
                        <Text
                          dangerouslySetInnerHTML={{ __html: item.deskripsi }}
                          fz="sm"
                          c="dimmed"
                          truncate
                          lineClamp={1}
                        />
                      </Box>
                    </TableTd>
                    <TableTd>
                      <Box w={200}>
                        <Text
                          fz="sm"
                          c="dimmed"
                          truncate
                          lineClamp={1}
                          dangerouslySetInnerHTML={{
                            __html: item.deskripsiSingkat || ''
                          }}
                        />
                      </Box>
                    </TableTd>
                    <TableTd>
                      <Button
                        variant="light"
                        color="blue"
                        onClick={() => router.push(`/admin/keamanan/pencegahan-kriminalitas/${item.id}`)}
                      >
                        <IconDeviceImacCog size={20} />
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
                        Tidak ada data pencegahan kriminalitas yang cocok
                      </Text>
                    </Center>
                  </TableTd>
                </TableTr>
              )}
            </TableTbody>
          </Table>
        </Box>
      </Paper>

      {/* Pagination */}
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
    </Box>
  );
}

export default PencegahanKriminalitas;
