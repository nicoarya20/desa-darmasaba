'use client'
import colors from '@/con/colors';
import { Box, Button, Center, Group, Pagination, Paper, Skeleton, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text, Title } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack, IconDeviceImacCog, IconPlus, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';

import HeaderSearch from '@/app/admin/(dashboard)/_com/header';
import fasilitasKesehatanState from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/fasilitasKesehatan';
import { useState } from 'react';


function DokterTenagaMedis() {
  const [search, setSearch] = useState("");
  const router = useRouter();
  return (
    <Box>
      <Box mb={10}>
        <Button variant="subtle" onClick={() => router.push('/admin/kesehatan/data-kesehatan-warga/fasilitas_kesehatan')}>
          <IconArrowBack color={colors['blue-button']} size={25} />
        </Button>
      </Box>
      <HeaderSearch
        title='Dokter dan Tenaga Medis'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListDokterTenagaMedis search={search} />
    </Box>
  );
}

function ListDokterTenagaMedis({ search }: { search: string }) {
  const stateFasilitasKesehatan = useProxy(fasilitasKesehatanState.dokter)
  const router = useRouter();
  const {
    data,
    loading,
    load,
    page,
    totalPages
  } = stateFasilitasKesehatan.findMany

  useShallowEffect(() => {
    load(page, 10, search)
  }, [page, search])

  const filteredData = data || []

  if (loading || !data) {
    return (
      <Box py={10}>
        <Skeleton h={500} />
      </Box>
    )
  }
  return (
    <Box py={10}>
      <Paper withBorder bg={colors['white-1']} p={'lg'} shadow="md" radius="md">
        {/* Judul + Tombol Tambah */}
        <Group justify="space-between" mb="md">
          <Title order={4}>Daftar Dokter dan Tenaga Medis</Title>
          <Button
            leftSection={<IconPlus size={18} />}
            color="blue"
            variant="light"
            onClick={() =>
              router.push(
                '/admin/kesehatan/data-kesehatan-warga/fasilitas_kesehatan/dokter-tenaga-medis/create'
              )
            }
          >
            Tambah Baru
          </Button>
        </Group>

        {/* Tabel */}
        <Box style={{ overflowX: "auto" }}>
          <Table highlightOnHover>
            <TableThead>
              <TableTr>
                <TableTh>Nama Dokter</TableTh>
                <TableTh>Spesialis</TableTh>
                <TableTh>Jadwal</TableTh>
                <TableTh>Aksi</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>
                      <Box w={150}>
                        <Text fw={500} truncate="end" lineClamp={1}>
                          {item.name}
                        </Text>
                      </Box>
                    </TableTd>
                    <TableTd>
                      <Box w={150}>
                        {item.specialist || '-'}
                      </Box>
                    </TableTd>
                    <TableTd>
                      <Box w={150}>
                        <Text dangerouslySetInnerHTML={{ __html: item.jadwal || '-' }} />
                      </Box>
                    </TableTd>
                    <TableTd>
                      <Button
                        variant="light"
                        color="blue"
                        onClick={() =>
                          router.push(
                            `/admin/kesehatan/data-kesehatan-warga/fasilitas_kesehatan/dokter-tenaga-medis/${item.id}`
                          )
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
                  <TableTd colSpan={4}>
                    <Center py={20}>
                      <Text c="dimmed">
                        Tidak ada fasilitas kesehatan yang cocok
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
  )
}

export default DokterTenagaMedis;
