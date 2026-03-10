'use client'
import colors from '@/con/colors';
import { Box, Button, Center, Group, Pagination, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text, Title } from '@mantine/core';
import { useDebouncedValue, useShallowEffect } from '@mantine/hooks';
import { IconEdit, IconPlus, IconSearch, IconTrash } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';
import prestasiState from '../../../_state/landing-page/prestasi-desa';


function KategoriPrestasiDesa() {
  const [search, setSearch] = useState("")
  return (
    <Box>
      <HeaderSearch
        title='Kategori Prestasi Desa'
        placeholder='Cari kategori prestasi...'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListKategoriPrestasi search={search} />
    </Box>
  );
}

function ListKategoriPrestasi({ search }: { search: string }) {
  const stateKategori = useProxy(prestasiState.kategoriPrestasi)
  const [modalHapus, setModalHapus] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const router = useRouter()
  const [debouncedSearch] = useDebouncedValue(search, 1000); // 500ms delay

  const handleHapus = () => {
    if (selectedId) {
      stateKategori.delete.byId(selectedId)
      setModalHapus(false)
      setSelectedId(null)
    }
  }

  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = stateKategori.findMany

  useShallowEffect(() => {
    load(page, 10, debouncedSearch)
  }, [page, debouncedSearch])

  const filteredData = data || []

  if (loading || !data) {
    return (
      <Stack py="md">
        <Skeleton h={500} />
      </Stack>
    )
  }

  return (
    <Box>
      {/* DESKTOP: Table */}
      <Paper bg={colors['white-1']} p="lg" radius="md" shadow="sm" withBorder>
        <Group justify="space-between" mb="xl">
          <Title order={4} size="lg" lh={1.2}>List Kategori Prestasi</Title>
          <Button
            leftSection={<IconPlus size={18} />}
            color="blue"
            variant="light"
            onClick={() => router.push('/admin/landing-page/prestasi-desa/kategori-prestasi-desa/create')}
          >
            Tambah Baru
          </Button>
        </Group>
       <Box visibleFrom="md" style={{ overflowX: 'auto' }}>
          <Table verticalSpacing="sm" highlightOnHover>
            <TableThead>
              <TableTr>
                <TableTh><Text fz="sm" fw={600} c="dark">Nama Kategori</Text></TableTh>
                <TableTh w={120} ta="center"><Text fz="sm" fw={600} c="dark">Edit</Text></TableTh>
                <TableTh w={120} ta="center"><Text fz="sm" fw={600} c="dark">Delete</Text></TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length === 0 ? (
                <TableTr>
                  <TableTd colSpan={3} ta="center">
                    <Text py="md" c="dimmed" fz="sm" lh={1.5}>
                      {search ? 'Tidak ada hasil yang cocok' : 'Belum ada data kategori'}
                    </Text>
                  </TableTd>
                </TableTr>
              ) : (
                filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>
                      <Text truncate="end" fz="md" lh={1.5} c="dark">
                        {item.name}
                      </Text>
                    </TableTd>
                    <TableTd ta="center" w={120}>
                      <Button
                        variant="light"
                        color="green"
                        size="sm"
                        onClick={() => router.push(`/admin/landing-page/prestasi-desa/kategori-prestasi-desa/${item.id}`)}
                      >
                        <IconEdit size={16} />
                      </Button>
                    </TableTd>
                    <TableTd ta="center" w={120}>
                      <Button
                        variant="light"
                        color="red"
                        size="sm"
                        onClick={() => {
                          setSelectedId(item.id);
                          setModalHapus(true);
                        }}
                      >
                        <IconTrash size={16} />
                      </Button>
                    </TableTd>
                  </TableTr>
                ))
              )}
            </TableTbody>
          </Table>

            <Center mt="xl">
              <Pagination
                value={page}
                onChange={(newPage) => load(newPage)}
                total={totalPages}
                withEdges
                size="sm"
                styles={{
                  control: {
                    '&[data-active]': {
                      background: `${colors['blue-button']} !important`,
                    },
                  },
                }}
              />
            </Center>
        </Box>

        {/* MOBILE: Card */}
        <Box hiddenFrom="md">
          <Stack gap="md">
            {filteredData.length === 0 ? (
              <Paper p="lg" ta="center">
                <Text c="dimmed" fz="sm" lh={1.5}>
                  {search ? 'Tidak ada hasil yang cocok' : 'Belum ada data kategori'}
                </Text>
              </Paper>
            ) : (
              filteredData.map((item) => (
                <Paper key={item.id} p="md" withBorder bg={colors['white-1']}>
                  <Stack gap="xs">
                    <Text fz="sm" lh={1.5} fw={600} c="dark">{item.name}</Text>
                    <Group justify="flex-end" gap="xs">
                      <Button
                        variant="light"
                        color="green"
                        size="xs"
                        onClick={() => router.push(`/admin/landing-page/prestasi-desa/kategori-prestasi-desa/${item.id}`)}
                      >
                        <IconEdit size={14} />
                      </Button>
                      <Button
                        variant="light"
                        color="red"
                        size="xs"
                        onClick={() => {
                          setSelectedId(item.id);
                          setModalHapus(true);
                        }}
                      >
                        <IconTrash size={14} />
                      </Button>
                    </Group>
                  </Stack>
                </Paper>
              ))
            )}

              <Center py="lg">
                <Pagination
                  value={page}
                  onChange={(newPage) => load(newPage)}
                  total={totalPages}
                  withEdges
                  size="xs"
                  styles={{
                    control: {
                      '&[data-active]': {
                        background: `${colors['blue-button']} !important`,
                      },
                    },
                  }}
                />
              </Center>
          </Stack>
        </Box>


        

        {/* Modal Konfirmasi Hapus */}
        <ModalKonfirmasiHapus
          opened={modalHapus}
          onClose={() => setModalHapus(false)}
          onConfirm={handleHapus}
          text='Apakah anda yakin ingin menghapus kategori prestasi ini?'
        />
      </Paper>
    </Box>
  );
}

export default KategoriPrestasiDesa