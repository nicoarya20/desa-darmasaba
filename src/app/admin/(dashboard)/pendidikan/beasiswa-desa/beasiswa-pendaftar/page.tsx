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
import { IconDeviceImacCog, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import beasiswaDesaState from '../../../_state/pendidikan/beasiswa-desa';

function BeasiswaPendaftar() {
  const [search, setSearch] = useState('');
  return (
    <Box>
      <HeaderSearch
        title='Beasiswa Pendaftar'
        placeholder='Cari nama, alamat, atau data lain...'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListBeasiswaPendaftar search={search} />
    </Box>
  );
}

function ListBeasiswaPendaftar({ search }: { search: string }) {
  const state = useProxy(beasiswaDesaState.beasiswaPendaftar);
  const router = useRouter();

  const { data, page, totalPages, loading, load } = state.findMany;

  useEffect(() => {
    load(page, 10, search);
  }, [page, search]);

  const filteredData = data || [];

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
          <Title order={4}>Daftar Beasiswa Pendaftar</Title>
        </Group>

        <Box style={{ overflowX: 'auto' }}>
          <Table highlightOnHover>
            <TableThead>
              <TableTr>
                <TableTh>No</TableTh>
                <TableTh>Nama Lengkap</TableTh>
                <TableTh>Alamat</TableTh>
                <TableTh>Tanggal Lahir</TableTh>
                <TableTh>Jenis Kelamin</TableTh>
                <TableTh>Aksi</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item, index) => (
                  <TableTr key={item.id}>
                    <TableTd>{index + 1}</TableTd>
                    <TableTd>
                      <Text truncate fz="sm">{item.namaLengkap}</Text>
                    </TableTd>
                    <TableTd>
                      <Text truncate fz="sm">{item.alamatKTP}</Text>
                    </TableTd>
                    <TableTd>
                      <Text truncate fz="sm">
                        {item.tanggalLahir ? new Date(item.tanggalLahir).toLocaleDateString() : '-'}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Text truncate fz="sm">{item.jenisKelamin}</Text>
                    </TableTd>
                    <TableTd>
                      <Button
                        variant="light"
                        color="blue"
                        onClick={() =>
                          router.push(`/admin/pendidikan/beasiswa-desa/beasiswa-pendaftar/${item.id}`)
                        }
                      >
                        <IconDeviceImacCog size={20} />
                        <Text ml={5}>Detail</Text>
                      </Button>
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={6}>
                    <Center py={20}>
                      <Text c="dimmed">Tidak ada data pendaftar yang cocok</Text>
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

export default BeasiswaPendaftar;
