'use client'
import colors from '@/con/colors';
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
  Title
} from '@mantine/core';
import { useDebouncedValue, useShallowEffect } from '@mantine/hooks';
import { IconDeviceImac, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../_com/header';
import ajukanIdeInovatifState from '../../_state/inovasi/ajukan-ide-inovatif';

function AjukanIdeInovatif() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      <HeaderSearch
        title='Ajukan Ide Inovatif'
        placeholder='Cari ide inovatif...'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListAjukanIdeInovatif search={search} />
    </Box>
  );
}

function ListAjukanIdeInovatif({ search }: { search: string }) {
  const state = useProxy(ajukanIdeInovatifState)
  const router = useRouter()
  const [debouncedSearch] = useDebouncedValue(search, 1000); // 500ms delay

  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = state.findMany;

  useShallowEffect(() => {
    load(page, 10, debouncedSearch)
  }, [page, debouncedSearch])

  const filteredData = data || []

  if (loading || !data) {
    return (
      <Stack py={10}>
        <Skeleton height={500} radius="md" />
      </Stack>
    )
  }

  return (
    <Box py={10}>
      <Paper withBorder bg={colors['white-1']} p="lg" shadow="md" radius="md">
        <Title order={4}>Daftar Ide Inovatif</Title>
        <Box style={{ overflowX: "auto" }}>
          <Table highlightOnHover>
            <TableThead>
              <TableTr>
                <TableTh style={{ width: '20%' }}>Nama</TableTh>
                <TableTh style={{ width: '30%' }}>Alamat</TableTh>
                <TableTh style={{ width: '30%' }}>Nama Ide Inovatif</TableTh>
                <TableTh style={{ width: '15%' }}>Aksi</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>
                      <Text fw={500} truncate lineClamp={1}>{item.name}</Text>
                    </TableTd>
                    <TableTd>
                      <Text truncate fz="sm" c="dimmed" lineClamp={1} dangerouslySetInnerHTML={{ __html: item.alamat }} />
                    </TableTd>
                    <TableTd>
                      <Text truncate fz="sm" lineClamp={1} dangerouslySetInnerHTML={{ __html: item.namaIde }} />
                    </TableTd>
                    <TableTd>
                      <Button
                        size="xs"
                        radius="md"
                        variant="light"
                        color="blue"
                        leftSection={<IconDeviceImac size={16} />}
                        onClick={() => router.push(`/admin/inovasi/ajukan-ide-inovatif/${item.id}`)}
                      >
                        Detail
                      </Button>
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={4}>
                    <Center py={20}>
                      <Text color="dimmed">Tidak ada ide inovatif yang cocok</Text>
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

export default AjukanIdeInovatif;
