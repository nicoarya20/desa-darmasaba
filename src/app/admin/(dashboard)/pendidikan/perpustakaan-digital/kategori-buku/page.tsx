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
import perpustakaanDigitalState from '../../../_state/pendidikan/perpustakaan-digital';

function KategoriBuku() {
  const [search, setSearch] = useState('');
  return (
    <Box>
      <HeaderSearch
        title='Kategori Buku'
        placeholder='Cari kategori...'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListKategoriBuku search={search} />
    </Box>
  );
}

function ListKategoriBuku({ search }: { search: string }) {
  const stateKategori = useProxy(perpustakaanDigitalState.kategoriBuku)
  const router = useRouter();
  const [modalHapus, setModalHapus] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [debouncedSearch] = useDebouncedValue(search, 1000);

  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = stateKategori.findMany;

  useShallowEffect(() => {
    load(page, 10, debouncedSearch)
  }, [page, debouncedSearch]);

  const handleDelete = () => {
    if (selectedId) {
      perpustakaanDigitalState.kategoriBuku.delete.delete(selectedId)
      setModalHapus(false)
      setSelectedId(null)
      perpustakaanDigitalState.kategoriBuku.findMany.load()
    }
  }

  const filteredData = data || [];

  if (loading || !data) {
    return (
      <Stack py={10}>
        <Skeleton height={500} radius="md" />
      </Stack>
    )
  }

  return (
    <Box py={{ base: 'sm', md: 'lg' }}>
      <Paper withBorder bg={colors['white-1']} p={{ base: 'md', md: 'lg' }} shadow="md" radius="md">
        <Group justify="space-between" mb={{ base: 'sm', md: 'md' }}>
          <Title order={4} lh={1.2}>
            Daftar Kategori Buku
          </Title>
          <Button
            leftSection={<IconPlus size={18} />}
            color="blue"
            variant="light"
            onClick={() => router.push('/admin/pendidikan/perpustakaan-digital/kategori-buku/create')}
          >
            Tambah Baru
          </Button>
        </Group>

        {/* Desktop Table */}
        <Box visibleFrom="md">
          <Table
            highlightOnHover
            miw={0}
            style={{
              tableLayout: 'fixed',
              width: '100%',
            }}
          >
            <TableThead>
              <TableTr>
                <TableTh style={{ width: '10%' }}>
                  <Text fz="xs" fw={600} lh={1.4} c="dimmed" ta="center">No</Text>
                </TableTh>
                <TableTh style={{ width: '60%' }}>
                  <Text fz="xs" fw={600} lh={1.4} c="dimmed">Nama Kategori</Text>
                </TableTh>
                <TableTh style={{ width: '15%' }}>
                  <Text fz="xs" fw={600} lh={1.4} c="dimmed" ta="center">Edit</Text>
                </TableTh>
                <TableTh style={{ width: '15%' }}>
                  <Text fz="xs" fw={600} lh={1.4} c="dimmed" ta="center">Hapus</Text>
                </TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item, index) => (
                  <TableTr key={item.id}>
                    <TableTd ta="center">
                      <Text fz="sm" fw={500} lh={1.5}>{index + 1}</Text>
                    </TableTd>
                    <TableTd>
                      <Text truncate fz="sm" fw={500} lh={1.5}>
                        {item.name}
                      </Text>
                    </TableTd>
                    <TableTd ta="center">
                      <Button variant="light" color="green" size="xs" onClick={() => router.push(`/admin/pendidikan/perpustakaan-digital/kategori-buku/${item.id}`)}>
                        <IconEdit size={16} />
                      </Button>
                    </TableTd>
                    <TableTd ta="center">
                      <Button
                        variant="light"
                        color="red"
                        size="xs"
                        disabled={perpustakaanDigitalState.kategoriBuku.delete.loading}
                        onClick={() => {
                          setSelectedId(item.id)
                          setModalHapus(true)
                        }}
                      >
                        <IconTrash size={16} />
                      </Button>
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={4}>
                    <Center py={20}>
                      <Text c="dimmed" fz="sm" fw={500} lh={1.5}>
                        Tidak ada data kategori buku yang cocok
                      </Text>
                    </Center>
                  </TableTd>
                </TableTr>
              )}
            </TableTbody>
          </Table>
        </Box>

        {/* Mobile Card View */}
        <Box hiddenFrom="md">
          <Stack gap="md">
            {filteredData.length > 0 ? (
              filteredData.map((item, index) => (
                <Paper key={item.id} withBorder radius="md" p="md" bg={colors['white-1']}>
                  <Stack gap={"xs"}>
                    <Box>
                      <Text fz="sm" fw={600} lh={1.4}>No</Text>
                      <Text fz="sm" fw={500} lh={1.5}>{index + 1}</Text>
                    </Box>
                    <Box>
                      <Text fz="sm" fw={600} lh={1.4}>Nama Kategori</Text>
                      <Text fz="sm" fw={500} lh={1.5}>{item.name}</Text>
                    </Box>
                    <Group justify="flex-end" mt="xs">
                      <Button
                        variant="light"
                        color="green"
                        size="xs"
                        onClick={() => router.push(`/admin/pendidikan/perpustakaan-digital/kategori-buku/${item.id}`)}
                      >
                        <IconEdit size={16} />
                      </Button>
                      <Button
                        variant="light"
                        color="red"
                        size="xs"
                        disabled={perpustakaanDigitalState.kategoriBuku.delete.loading}
                        onClick={() => {
                          setSelectedId(item.id)
                          setModalHapus(true)
                        }}
                      >
                        <IconTrash size={16} />
                      </Button>
                    </Group>
                  </Stack>
                </Paper>
              ))
            ) : (
              <Center py={20}>
                <Text c="dimmed" fz="sm" fw={500} lh={1.5}>
                  Tidak ada data kategori buku yang cocok
                </Text>
              </Center>
            )}
          </Stack>
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
            mt={{ base: 'sm', md: 'md' }}
            mb={{ base: 'sm', md: 'md' }}
            color="blue"
            radius="md"
          />
        </Center>


      {/* Modal Konfirmasi Hapus */}
      <ModalKonfirmasiHapus
        opened={modalHapus}
        onClose={() => setModalHapus(false)}
        onConfirm={handleDelete}
        text='Apakah anda yakin ingin menghapus kategori buku ini?'
      />
    </Box>
  )
}

export default KategoriBuku;