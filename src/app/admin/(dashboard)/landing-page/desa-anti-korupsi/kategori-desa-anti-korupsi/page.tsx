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
import korupsiState from '../../../_state/landing-page/desa-anti-korupsi';


function KategoriDesaAntiKorupsi() {
  const [search, setSearch] = useState("")
  return (
    <Box>
      <HeaderSearch
        title='Kategori Desa Anti Korupsi'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListKategoriKegiatan search={search} />
    </Box>
  );
}

function ListKategoriKegiatan({ search }: { search: string }) {
  const stateKategori = useProxy(korupsiState.kategoriDesaAntiKorupsi)
  const [modalHapus, setModalHapus] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const router = useRouter()

  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = stateKategori.findMany;

  const handleHapus = () => {
    if (selectedId) {
      stateKategori.delete.byId(selectedId)
      setModalHapus(false)
      setSelectedId(null)
    }
  }

  useShallowEffect(() => {
    load(page, 10, search)
  }, [page, search])

  const filteredData = data || []

  if (loading || !data) {
    return (
      <Stack py={10}>
        <Skeleton height={600} radius="md" />
      </Stack>
    );
  }

  return (
    <Box py={10}>
      <Paper bg={colors['white-1']} p={'lg'} shadow="md" radius="md">
        <Group justify="space-between" mb="md">
          <Title order={4}>Daftar Kategori Kegiatan</Title>
          <Tooltip label="Tambah Kategori" withArrow>
            <Button
              leftSection={<IconPlus size={18} />}
              color="blue"
              variant="light"
              onClick={() => router.push('/admin/landing-page/desa-anti-korupsi/kategori-desa-anti-korupsi/create')}
            >
              Tambah Baru
            </Button>
          </Tooltip>
        </Group>
        <Box style={{ overflowX: "auto" }}>
          <Table highlightOnHover striped verticalSpacing="sm">
            <TableThead>
              <TableTr>
                <TableTh>Nama Kategori</TableTh>
                <TableTh>Edit</TableTh>
                <TableTh>Hapus</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>
                      <Text fw={500}>{item.name}</Text>
                    </TableTd>
                    <TableTd>
                      <Tooltip label="Edit" withArrow>
                        <Button
                          variant="light"
                          color="green"
                          size="sm"
                          onClick={() => router.push(`/admin/landing-page/desa-anti-korupsi/kategori-desa-anti-korupsi/${item.id}`)}
                        >
                          <IconEdit size={18} />
                        </Button>
                      </Tooltip>
                    </TableTd>
                    <TableTd>
                      <Tooltip label="Hapus" withArrow>
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
              ) : (
                <TableTr>
                  <TableTd colSpan={2}>
                    <Center py={20}>
                      <Text c="dimmed">Tidak ada data kategori yang ditemukan</Text>
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
      {/* Modal Konfirmasi Hapus */}
      <ModalKonfirmasiHapus
        opened={modalHapus}
        onClose={() => setModalHapus(false)}
        onConfirm={handleHapus}
        text='Apakah anda yakin ingin menghapus kategori kegiatan ini?'
      />
    </Box>
  );
}

export default KategoriDesaAntiKorupsi
