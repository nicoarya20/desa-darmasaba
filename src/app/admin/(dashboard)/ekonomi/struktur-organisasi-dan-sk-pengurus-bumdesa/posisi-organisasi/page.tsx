'use client'
import colors from '@/con/colors';
import { Box, Button, Center, Group, Pagination, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text, Title } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconEdit, IconPlus, IconSearch, IconTrash } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';
import stateStrukturBumDes from '../../../_state/ekonomi/struktur-organisasi/struktur-organisasi';


function PosisiOrganisasiBumDes() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      <HeaderSearch
        title='Posisi Organisasi BUMDes'
        placeholder='Cari posisi organisasi...'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListPosisiOrganisasiBumDes search={search} />
    </Box>
  );
}

function ListPosisiOrganisasiBumDes({ search }: { search: string }) {
  const stateOrganisasi = useProxy(stateStrukturBumDes.posisiOrganisasi)
  const router = useRouter();
  const [modalHapus, setModalHapus] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = stateOrganisasi.findMany;

  useShallowEffect(() => {
    load(page, 10, search);
  }, [page, search]);

  const handleHapus = async () => {
    if (selectedId) {
      await stateOrganisasi.delete.byId(selectedId);
      setModalHapus(false)
      setSelectedId(null)
    }
  }

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
      <Paper withBorder bg={colors['white-1']} p="lg" shadow="md" radius="md">
        <Group justify="space-between" mb="md">
          <Title order={4}>Daftar Posisi Organisasi BumDes</Title>
          <Button
            leftSection={<IconPlus size={18} />}
            color="blue"
            variant="light"
            onClick={() => router.push('/admin/ekonomi/struktur-organisasi-dan-sk-pengurus-bumdesa/posisi-organisasi/create')}
          >
            Tambah Baru
          </Button>
        </Group>
        <Box style={{ overflowX: 'auto' }}>
          <Table highlightOnHover>
            <TableThead>
              <TableTr>
                <TableTh style={{ width: '20%' }}>Nama Posisi</TableTh>
                <TableTh style={{ width: '20%' }}>Deskripsi</TableTh>
                <TableTh style={{ width: '20%' }}>Hierarki</TableTh>
                <TableTh style={{ width: '20%' }}>Edit</TableTh>
                <TableTh style={{ width: '20%' }}>Hapus</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd style={{ width: '20%' }}>
                      <Text fw={500} truncate="end" lineClamp={1}>{item.nama}</Text>
                    </TableTd>
                    <TableTd style={{ width: '20%' }}>
                      <Box w={200}>
                        <Text lineClamp={1} fz="sm" c="dimmed" dangerouslySetInnerHTML={{ __html: item.deskripsi || '-' }} />
                      </Box>
                    </TableTd>
                    <TableTd style={{ width: '20%' }}>
                      <Text>{item.hierarki || '-'}</Text>
                    </TableTd>
                    <TableTd style={{ width: '20%' }}>
                      <Button
                        variant="light"
                        color="green"
                        size="sm"
                        onClick={() => router.push(`/admin/ekonomi/struktur-organisasi-dan-sk-pengurus-bumdesa/posisi-organisasi/${item.id}`)}
                      >
                        <IconEdit size={18} />
                      </Button>
                    </TableTd>
                    <TableTd style={{ width: '20%' }}>
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
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={4}>
                    <Center py={20}>
                      <Text color="dimmed">Tidak ada data posisi organisasi yang cocok</Text>
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
      {/* Modal Hapus */}
      <ModalKonfirmasiHapus
        opened={modalHapus}
        onClose={() => setModalHapus(false)}
        onConfirm={handleHapus}
        text="Apakah anda yakin ingin menghapus posisi organisasi BumDes ini?"
      />
    </Box>
  );
}

export default PosisiOrganisasiBumDes;
