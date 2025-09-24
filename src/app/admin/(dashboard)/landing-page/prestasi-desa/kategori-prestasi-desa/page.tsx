'use client'
import colors from '@/con/colors';
import { Box, Button, Center, Group, Pagination, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text, Title, Tooltip } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
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
    load(page, 10, search)
  }, [page, search])

  const filteredData = data || []

  if (loading || !data) {
    return (
      <Stack py={10}>
        <Skeleton h={500} />
      </Stack>
    )
  }

  return (
    <Box>
      <Paper bg={colors['white-1']} p="lg" radius="md" shadow="sm" withBorder>
        <Group justify="space-between" mb="md">
          <Title order={4} c="dark">List Kategori Prestasi</Title>
          <Tooltip label="Tambah Kategori Prestasi" withArrow>
            <Button leftSection={<IconPlus size={18} />} color="blue" variant="light" onClick={() => router.push('/admin/landing-page/prestasi-desa/kategori-prestasi-desa/create')}>
              Tambah Baru
            </Button>
          </Tooltip>
        </Group>

        <Box style={{ overflowX: 'auto' }}>
          <Table verticalSpacing="sm" highlightOnHover>
            <TableThead>
              <TableTr>
                <TableTh>Nama Kategori</TableTh>
                <TableTh style={{ width: '120px' }} ta={'center'}>Edit</TableTh>
                <TableTh ta={'center'} style={{ width: '120px' }}>Delete</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length === 0 ? (
                <TableTr>
                  <TableTd colSpan={2} style={{ textAlign: 'center' }}>
                    <Text py="md" c="dimmed">
                      {search ? 'Tidak ada hasil yang cocok' : 'Belum ada data kategori'}
                    </Text>
                  </TableTd>
                </TableTr>
              ) : (
                filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>
                      <Box w={200}>
                        <Text truncate="end" fz={"sm"}>{item.name}</Text>
                      </Box>
                    </TableTd>
                    <TableTd style={{ textAlign: 'center', width: '120px' }}>
                      <Tooltip label="Edit" withArrow position="top">
                        <Button
                          variant="light"
                          color="green"
                          size="sm"
                          onClick={() => router.push(`/admin/landing-page/prestasi-desa/kategori-prestasi-desa/${item.id}`)}
                        >
                          <IconEdit size={18} />
                        </Button>
                      </Tooltip>
                    </TableTd>
                    <TableTd style={{ textAlign: 'center', width: '120px' }}>
                      <Tooltip label="Hapus" withArrow position="top">
                        <Button
                          variant="light"
                          color="red"
                          size="sm"
                          onClick={() => {
                            setSelectedId(item.id);
                            setModalHapus(true);
                          }}
                        >
                          <IconTrash size={18} />
                        </Button>
                      </Tooltip>
                    </TableTd>
                  </TableTr>
                ))
              )}
            </TableTbody>
          </Table>
        </Box>

        {totalPages > 1 && (
          <Center mt="lg">
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
        )}
      </Paper>
      {/* Modal Konfirmasi Hapus */}
      <ModalKonfirmasiHapus
        opened={modalHapus}
        onClose={() => setModalHapus(false)}
        onConfirm={handleHapus}
        text='Apakah anda yakin ingin menghapus kategori prestasi ini?'
      />
    </Box >
  );
}

export default KategoriPrestasiDesa
