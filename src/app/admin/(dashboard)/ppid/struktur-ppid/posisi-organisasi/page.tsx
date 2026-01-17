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
    const [debouncedSearch] = useDebouncedValue(search, 1000);

  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = stateOrganisasi.findMany;

  useShallowEffect(() => {
    load(page, 10, debouncedSearch);
  }, [page, debouncedSearch]);

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
      <Stack py={{ base: 'sm', md: 'md' }}>
        <Skeleton height={600} radius="md" />
      </Stack>
    );
  }

  return (
    <Box py={{ base: 'sm', md: 'md' }}>
      <Paper withBorder bg={colors['white-1']} p={{ base: 'md', md: 'lg' }} shadow="md" radius="md">
        <Group justify="space-between" mb={{ base: 'sm', md: 'md' }}>
          <Title order={4}>Daftar Posisi Organisasi PPID</Title>
          <Button
            leftSection={<IconPlus size={18} />}
            color="blue"
            variant="light"
            onClick={() => router.push('/admin/ppid/struktur-ppid/posisi-organisasi/create')}
          >
            Tambah Baru
          </Button>
        </Group>

        {/* Desktop Table */}
       <Box visibleFrom="md" style={{ overflowX: 'auto' }}>
         <Table highlightOnHover
    layout="fixed" // 🔥 PENTING
    withColumnBorders={false}>
            <TableThead>
              <TableTr>
                <TableTh fz="sm" fw={600} lh={1.4}>Nama Posisi</TableTh>
                <TableTh fz="sm" fw={600} lh={1.4}>Deskripsi</TableTh>
                <TableTh fz="sm" fw={600} lh={1.4}>Hierarki</TableTh>
                <TableTh fz="sm" fw={600} lh={1.4}>Edit</TableTh>
                <TableTh fz="sm" fw={600} lh={1.4}>Hapus</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>
                      <Text fz="md" fw={600} lh={1.5} truncate="end" lineClamp={1}>{item.nama}</Text>
                    </TableTd>
                    <TableTd w={200}>
                      <Text fz="sm" lh={1.5} c="dimmed" lineClamp={1} dangerouslySetInnerHTML={{ __html: item.deskripsi || '-' }} />
                    </TableTd>
                    <TableTd>
                      <Text fz="md" lh={1.5}>{item.hierarki || '-'}</Text>
                    </TableTd>
                    <TableTd>
                      <Button
                        variant="light"
                        color="green"
                        size="sm"
                        onClick={() => router.push(`/admin/ppid/struktur-ppid/posisi-organisasi/${item.id}`)}
                      >
                        <IconEdit size={18} />
                      </Button>
                    </TableTd>
                    <TableTd>
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
                  <TableTd colSpan={5}>
                    <Center py={{ base: 'sm', md: 'md' }}>
                      <Text fz="sm" c="dimmed" ta="center" lh={1.5}>
                        Tidak ada data posisi organisasi yang cocok
                      </Text>
                    </Center>
                  </TableTd>
                </TableTr>
              )}
            </TableTbody>
          </Table>
        </Box>

        {/* Mobile Card View */}
        <Stack gap="xs" hiddenFrom="md">
          {filteredData.length > 0 ? (
            filteredData.map((item) => (
              <Paper key={item.id} withBorder p="sm" radius="sm">
                <Stack gap={'xs'}>
                  <Box>
                    <Text fz="xs" fw={600} lh={1.4}>Nama Posisi</Text>
                    <Text fz="sm" fw={600} lh={1.5}>{item.nama}</Text>
                  </Box>
                  <Box>
                    <Text fz="xs" fw={600} lh={1.4}>Deskripsi</Text>
                    <Text fz="sm" lh={1.5} dangerouslySetInnerHTML={{ __html: item.deskripsi || '-' }} />
                  </Box>
                  <Box>
                    <Text fz="xs" fw={600} lh={1.4}>Hierarki</Text>
                    <Text fz="sm" lh={1.5}>{item.hierarki || '-'}</Text>
                  </Box>
                  <Group justify="flex-end" gap="xs">
                    <Button
                      variant="light"
                      color="green"
                      size="xs"
                      onClick={() => router.push(`/admin/ppid/struktur-ppid/posisi-organisasi/${item.id}`)}
                    >
                      <IconEdit size={16} />
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
                      <IconTrash size={16} />
                    </Button>
                  </Group>
                </Stack>
              </Paper>
            ))
          ) : (
            <Center py="sm">
              <Text fz="sm" c="dimmed" ta="center" lh={1.5}>
                Tidak ada data posisi organisasi yang cocok
              </Text>
            </Center>
          )}
        </Stack>
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