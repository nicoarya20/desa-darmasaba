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
import stateStrukturPPID from '../../../_state/ppid/struktur_ppid/struktur_PPID';

function PosisiOrganisasiPPID() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      <HeaderSearch
        title='Posisi Organisasi PPID'
        placeholder='Cari posisi organisasi...'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListPosisiOrganisasiPPID search={search} />
    </Box>
  );
}

function ListPosisiOrganisasiPPID({ search }: { search: string }) {
  const stateOrganisasi = useProxy(stateStrukturPPID.posisiOrganisasi)
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
          <Title order={4}>Daftar Posisi Organisasi PPID</Title>
          <Tooltip label="Tambah Posisi Organisasi" withArrow>
            <Button 
              leftSection={<IconPlus size={18} />} 
              color="blue" 
              variant="light" 
              onClick={() => router.push('/admin/ppid/struktur-ppid/posisi-organisasi/create')}
            >
              Tambah Baru
            </Button>
          </Tooltip>
        </Group>
        <Box style={{ overflowX: 'auto' }}>
          <Table highlightOnHover>
            <TableThead>
              <TableTr>
                <TableTh style={{ width: '25%' }}>Nama Posisi</TableTh>
                <TableTh style={{ width: '45%' }}>Deskripsi</TableTh>
                <TableTh style={{ width: '15%' }}>Hierarki</TableTh>
                <TableTh style={{ width: '15%' }}>Aksi</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd style={{ width: '25%' }}>
                      <Text fw={500} truncate="end" lineClamp={1}>{item.nama}</Text>
                    </TableTd>
                    <TableTd style={{ width: '45%' }}>
                      <Text lineClamp={2} fz="sm" c="dimmed" dangerouslySetInnerHTML={{ __html: item.deskripsi || '-' }} />
                    </TableTd>
                    <TableTd style={{ width: '15%' }}>
                      <Text>{item.hierarki || '-'}</Text>
                    </TableTd>
                    <TableTd style={{ width: '15%' }}>
                      <Group gap="xs">
                        <Tooltip label="Edit" withArrow>
                          <Button
                            variant="light"
                            color="green"
                            size="sm"
                            onClick={() => router.push(`/admin/ppid/struktur-ppid/posisi-organisasi/${item.id}`)}
                          >
                            <IconEdit size={18} />
                          </Button>
                        </Tooltip>
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
                      </Group>
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
        text="Apakah anda yakin ingin menghapus posisi organisasi PPID ini?"
      />
    </Box>
  );
}

export default PosisiOrganisasiPPID;
