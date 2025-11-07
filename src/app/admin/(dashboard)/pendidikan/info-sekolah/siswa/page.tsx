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
  Title
} from '@mantine/core';
import { IconDeviceImacCog, IconPlus, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import infoSekolahPaud from '../../../_state/pendidikan/info-sekolah-paud';

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
  const stateSiswa = useProxy(infoSekolahPaud.siswa)
  const router = useRouter();

  const { data, page, totalPages, loading, load } = stateSiswa.findMany;

  useEffect(() => {
    load(page, 10, search)
  }, [page, search])

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
      <Paper withBorder bg={colors['white-1']} p={'lg'} shadow="md" radius="md">
        <Group justify="space-between" mb="md">
          <Title order={4}>Daftar Siswa</Title>
          <Button
            leftSection={<IconPlus size={18} />}
            color="blue"
            variant="light"
            onClick={() => router.push('/admin/pendidikan/info-sekolah/siswa/create')}
          >
            Tambah Baru
          </Button>
        </Group>

        <Box style={{ overflowX: "auto" }}>
          <Table highlightOnHover striped withRowBorders style={{ minWidth: '700px' }}>
            <TableThead>
              <TableTr>
                <TableTh style={{ width: '35%' }}>Nama Siswa</TableTh>
                <TableTh style={{ width: '35%' }}>Lembaga</TableTh>
                <TableTh style={{ width: '20%' }}>Aksi</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>
                      <Text fw={500} truncate="end">{item.nama}</Text>
                    </TableTd>
                    <TableTd>
                      <Text truncate="end" c="dimmed">{item.lembaga.nama}</Text>
                    </TableTd>
                    <TableTd>
                      <Button
                        variant="light"
                        color="blue"
                        onClick={() => router.push(`/admin/pendidikan/info-sekolah/siswa/${item.id}`)}
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
                      <Text color="dimmed">Tidak ada data siswa yang cocok</Text>
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
  )
}

export default Siswa;
