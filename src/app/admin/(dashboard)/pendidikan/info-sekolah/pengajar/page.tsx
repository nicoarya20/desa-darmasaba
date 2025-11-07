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
  const listState = useProxy(infoSekolahPaud.pengajar)
  const router = useRouter();

  const {
    data,
    page,
    totalPages,
    loading,
    load
  } = listState.findMany;

  useEffect(() => {
    load(page, 10, search)
  }, [page, search])

  const filteredData = data || []

  if (loading || !data) {
    return (
      <Stack py={10}>
        <Skeleton h={500} radius="md" />
      </Stack>
    )
  }

  return (
    <Box py={10}>
      <Paper withBorder bg={colors['white-1']} p={'lg'} shadow="md" radius="md">
        <Group justify="space-between" mb="md">
          <Title order={4}>Daftar Pengajar</Title>
          <Button
            leftSection={<IconPlus size={18} />}
            color="blue"
            variant="light"
            onClick={() => router.push('/admin/pendidikan/info-sekolah/pengajar/create')}
          >
            Tambah Baru
          </Button>
        </Group>

        <Box style={{ overflowX: 'auto' }}>
          <Table highlightOnHover striped withRowBorders style={{ minWidth: '700px' }}>
            <TableThead>
              <TableTr>
                <TableTh style={{ width: '35%' }}>Nama Pengajar</TableTh>
                <TableTh style={{ width: '35%' }}>Lembaga</TableTh>
                <TableTh style={{ width: '20%' }}>Aksi</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>
                      <Text fw={500} truncate="end" lineClamp={1}>{item.nama}</Text>
                    </TableTd>
                    <TableTd>
                      <Text truncate="end" fz="sm" c="dimmed">{item.lembaga.nama}</Text>
                    </TableTd>
                    <TableTd>
                      <Button
                        variant="light"
                        color="blue"
                        onClick={() => router.push(`/admin/pendidikan/info-sekolah/pengajar/${item.id}`)}
                      >
                        <IconDeviceImacCog size={20} />
                        <Text ml={5}>Detail</Text>
                      </Button>
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={3}>
                    <Center py={20}>
                      <Text c="dimmed">Tidak ada data pengajar yang cocok</Text>
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
            load(newPage, 10, search)
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
          total={totalPages}
          mt="md"
          mb="md"
          color="blue"
          radius="md"
        />
      </Center>
    </Box>
  )
}

export default Pengajar;
