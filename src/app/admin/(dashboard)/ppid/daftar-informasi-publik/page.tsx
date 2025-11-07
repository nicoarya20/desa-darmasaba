'use client'
import colors from '@/con/colors';
import { Box, Button, Center, Group, Pagination, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text, Title } from '@mantine/core';
import { useShallowEffect, useViewportSize } from '@mantine/hooks';
import { IconDeviceImacCog, IconPlus, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../_com/header';
import daftarInformasiPublik from '../../_state/ppid/daftar_informasi_publik/daftarInformasiPublik';

function DaftarInformasiPublik() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      <HeaderSearch
        title='Daftar Informasi Publik'
        placeholder='Cari jenis informasi atau deskripsi...'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListDaftarInformasi search={search} />
    </Box>
  );
}

function ListDaftarInformasi({ search }: { search: string }) {
  const listData = useProxy(daftarInformasiPublik)
  const router = useRouter()

  const { data, page, totalPages, loading, load } = listData.findMany
  const { width } = useViewportSize()
  const isMobile = width < 768

  useShallowEffect(() => {
    load(page, 10, search)
  }, [page, search])

  const filteredData = data || []

  if (loading || !data) {
    return (
      <Stack py={10}>
        <Skeleton height={600} radius="md" />
      </Stack>
    )
  }

  return (
    <Box py="md">
      <Paper withBorder bg={colors['white-1']} p="lg" shadow="md" radius="md">
        <Group justify="space-between" mb="md">
          <Title order={4}>List Daftar Informasi Publik</Title>
            <Button
              leftSection={<IconPlus size={18} />}
              color="blue"
              variant="light"
              onClick={() => router.push('/admin/ppid/daftar-informasi-publik/create')}
            >
              {isMobile ? 'Tambah' : 'Tambah Baru'}
            </Button>
        </Group>

        {filteredData.length === 0 ? (
          <Stack align="center" py="xl">
            <IconDeviceImacCog size={40} stroke={1.5} color={colors['blue-button']} />
            <Text fw={500} c="dimmed">Belum ada informasi publik yang tersedia</Text>
          </Stack>
        ) : (
          <Box style={{ overflowX: 'auto' }}>
            <Table
              highlightOnHover
              striped
              stickyHeader
              style={{ minWidth: '700px' }}
            >
              <TableThead>
                <TableTr>
                  <TableTh style={{ width: '5%', textAlign: 'center' }}>No</TableTh>
                  <TableTh style={{ width: '25%' }}>Jenis Informasi</TableTh>
                  <TableTh style={{ width: '40%' }}>Deskripsi</TableTh>
                  <TableTh style={{ width: '20%', textAlign: 'center' }}>Aksi</TableTh>
                </TableTr>
              </TableThead>
              <TableTbody>
                {filteredData.map((item, index) => (
                  <TableTr key={item.id}>
                    <TableTd style={{ textAlign: 'center' }}>
                      <Text fz="sm">{(page - 1) * 10 + index + 1}</Text>
                    </TableTd>
                    <TableTd>
                        <Box w={200}>
                          <Text fw={500} lineClamp={1}>{item.jenisInformasi}</Text>
                        </Box>
                    </TableTd>
                    <TableTd>
                        <Box w={200}>
                          <Text lineClamp={1} fz="sm" c="dimmed">
                            {item.deskripsi?.replace(/<[^>]*>?/gm, '').substring(0, 80) + '...'}
                          </Text>
                        </Box>

                    </TableTd>
                    <TableTd style={{ textAlign: 'center' }}>
                        <Button
                          size="xs"
                          radius="md"
                          variant="light"
                          color="blue"
                          leftSection={<IconDeviceImacCog size={16} />}
                          onClick={() => router.push(`/admin/ppid/daftar-informasi-publik/${item.id}`)}
                        >
                          Detail
                        </Button>
                    </TableTd>
                  </TableTr>
                ))}
              </TableTbody>
            </Table>
          </Box>
        )}
      </Paper>
      <Center mt="lg">
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

export default DaftarInformasiPublik;
