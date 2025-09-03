/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import colors from '@/con/colors';
import {
  Box, Button, Center, Paper, Skeleton, Stack,
  Table, TableTbody, TableTd, TableTh, TableThead, TableTr,
  Text, Title, Tooltip, Pagination
} from '@mantine/core';
import { IconEdit, IconSearch, IconTrash, IconPlus } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';
import stateDesaPengumuman from '../../../_state/desa/pengumuman';

function KategoriPengumuman() {
  const [search, setSearch] = useState('');
  return (
    <Box>
      <HeaderSearch
        title='Kategori Pengumuman'
        placeholder='Cari nama kategori...'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListKategoriPengumuman search={search} />
    </Box>
  );
}

function ListKategoriPengumuman({ search }: { search: string }) {
  const listDataState = useProxy(stateDesaPengumuman.category)
  const router = useRouter();
  const [modalHapus, setModalHapus] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const { data, page, totalPages, loading, load } = listDataState.findMany;

  useEffect(() => {
    load(1, 10, search)
  }, [search])

  const handleDelete = () => {
    if (selectedId) {
      listDataState.delete.delete(selectedId)
      setModalHapus(false)
      setSelectedId(null)
      load(page, 10, search)
    }
  }

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
        <Stack>
          <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
            <Title order={4}>List Kategori Pengumuman</Title>
            <Tooltip label="Tambah Kategori Pengumuman" withArrow>
              <Button
                leftSection={<IconPlus size={18} />}
                color="blue"
                variant="light"
                onClick={() => router.push('/admin/desa/pengumuman/kategori-pengumuman/create')}
              >
                Tambah Baru
              </Button>
            </Tooltip>
          </Box>

          <Box style={{ overflowX: 'auto' }}>
            <Table highlightOnHover striped withRowBorders style={{ minWidth: '700px' }}>
              <TableThead>
                <TableTr>
                  <TableTh style={{ width: '10%' }}>No</TableTh>
                  <TableTh style={{ width: '60%' }}>Nama</TableTh>
                  <TableTh style={{ width: '15%' }}>Edit</TableTh>
                  <TableTh style={{ width: '15%' }}>Hapus</TableTh>
                </TableTr>
              </TableThead>
              <TableTbody>
                {filteredData.length > 0 ? (
                  filteredData.map((item, index) => (
                    <TableTr key={item.id}>
                      <TableTd>
                        <Text fz="sm">{(page - 1) * 10 + index + 1}</Text>
                      </TableTd>
                      <TableTd>
                        <Text truncate lineClamp={1}>{item.name}</Text>
                      </TableTd>
                      <TableTd>
                        <Tooltip label="Edit Kategori Pengumuman" withArrow>
                          <Button
                            variant='light'
                            color='green'
                            onClick={() => router.push(`/admin/desa/pengumuman/kategori-pengumuman/${item.id}`)}
                          >
                            <IconEdit size={20} />
                          </Button>
                        </Tooltip>
                      </TableTd>
                      <TableTd>
                        <Tooltip label="Hapus Kategori Pengumuman" withArrow>
                          <Button
                            variant='light'
                            color='red'
                            disabled={listDataState.delete.loading}
                            onClick={() => {
                              setSelectedId(item.id)
                              setModalHapus(true)
                            }}>
                            <IconTrash size={20} />
                          </Button>
                        </Tooltip>
                      </TableTd>
                    </TableTr>
                  ))
                ) : (
                  <TableTr>
                    <TableTd colSpan={4}>
                      <Center py={20}>
                        <Text c="dimmed">Tidak ada data kategori pengumuman yang cocok</Text>
                      </Center>
                    </TableTd>
                  </TableTr>
                )}
              </TableTbody>
            </Table>
          </Box>
        </Stack>
      </Paper>

      <Center mt="md">
        <Pagination
          value={page}
          onChange={(newPage) => load(newPage, 10, search)}
          total={totalPages}
          color="blue"
          radius="md"
        />
      </Center>

      <ModalKonfirmasiHapus
        opened={modalHapus}
        onClose={() => setModalHapus(false)}
        onConfirm={handleDelete}
        text='Apakah anda yakin ingin menghapus kategori Pengumuman ini?'
      />
    </Box>
  )
}

export default KategoriPengumuman;
