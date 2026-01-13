'use client'
import colors from '@/con/colors';
import {
  Box,
  Button,
  Center,
  Group,
  Pagination,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
  Text,
  Title,
} from '@mantine/core';
import { useDebouncedValue, useShallowEffect } from '@mantine/hooks';
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
  const stateOrganisasi = useProxy(stateStrukturBumDes.posisiOrganisasi);
  const router = useRouter();
  const [modalHapus, setModalHapus] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
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
      setModalHapus(false);
      setSelectedId(null);
    }
  };

  const filteredData = data || [];

  if (loading || !data) {
    return (
      <Stack py={{ base: 'sm', md: 'md' }}>
        <Skeleton height={600} radius="md" />
      </Stack>
    );
  }

  return (
    <Box py={{ base: 'sm', md: 'md' }}>
      <Paper withBorder bg={colors['white-1']} p={{ base: 'sm', md: 'lg' }} shadow="md" radius="md">
        <Group justify="space-between" mb={{ base: 'sm', md: 'md' }}>
          <Title
            order={4}
            lh={{ base: 1.2, md: 1.1 }}
          >
            Daftar Posisi Organisasi BumDes
          </Title>
          <Button
            leftSection={<IconPlus size={18} />}
            color="blue"
            variant="light"
            onClick={() =>
              router.push(
                '/admin/ekonomi/Struktur-Organisasi-Dan-Sk-Pengurus-BumDes/posisi-organisasi/create'
              )
            }
          >
            Tambah Baru
          </Button>
        </Group>

        {/* Desktop Table */}
       <Box visibleFrom="md" style={{ overflowX: 'auto' }}>
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
                <TableTh style={{ width: '25%' }}>
                  <Text fz="sm" fw={600} lh={1.4} ta="left">
                    Nama Posisi
                  </Text>
                </TableTh>
                <TableTh style={{ width: '25%' }}>
                  <Text fz="sm" fw={600} lh={1.4} ta="left">
                    Deskripsi
                  </Text>
                </TableTh>
                <TableTh style={{ width: '20%' }}>
                  <Text fz="sm" fw={600} lh={1.4} ta="left">
                    Hierarki
                  </Text>
                </TableTh>
                <TableTh style={{ width: '15%' }}>
                  <Text fz="sm" fw={600} lh={1.4} ta="center">
                    Edit
                  </Text>
                </TableTh>
                <TableTh style={{ width: '15%' }}>
                  <Text fz="sm" fw={600} lh={1.4} ta="center">
                    Hapus
                  </Text>
                </TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>
                      <Text fz="md" fw={500} lh={1.45} truncate="end" lineClamp={1}>
                        {item.nama}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Text 
                        fz="sm" 
                        fw={500} 
                        lh={1.45} 
                        c="dimmed" 
                        lineClamp={2} 
                        dangerouslySetInnerHTML={{ __html: item.deskripsi || '-' }}
                      />
                    </TableTd>
                    <TableTd>
                      <Text fz="md" fw={500} lh={1.45}>{item.hierarki || '-'}</Text>
                    </TableTd>
                    <TableTd ta="center">
                      <Button
                        variant="light"
                        color="green"
                        size="xs"
                        onClick={() =>
                          router.push(
                            `/admin/ekonomi/Struktur-Organisasi-Dan-Sk-Pengurus-BumDes/posisi-organisasi/${item.id}`
                          )
                        }
                      >
                        <IconEdit size={16} />
                      </Button>
                    </TableTd>
                    <TableTd ta="center">
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
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={5}>
                    <Center py={{ base: 'sm', md: 'md' }}>
                      <Text c="dimmed" fz="sm" lh={1.4}>
                        Tidak ada data posisi organisasi yang cocok
                      </Text>
                    </Center>
                  </TableTd>
                </TableTr>
              )}
            </TableTbody>
          </Table>
        </Box>

        {/* Mobile Cards */}
        <Box hiddenFrom="md">
          <Stack gap="xs">
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <Paper key={item.id} withBorder p="sm" radius="md">
                  <Stack gap={"xs"}>
                    <Box>
                      <Text fz="sm" fw={600} lh={1.4}>
                        Nama Posisi
                      </Text>
                      <Text fz="sm" fw={500} lh={1.4}>
                        {item.nama}
                      </Text>
                    </Box>
                    <Box>
                      <Text fz="sm" fw={600} lh={1.4}>
                        Deskripsi
                      </Text>
                      <Text 
                        fz="sm" 
                        fw={500} 
                        lh={1.45} 
                        c="dimmed" 
                        lineClamp={2} 
                        dangerouslySetInnerHTML={{ __html: item.deskripsi || '-' }}
                      />
                    </Box>
                    <Box>
                      <Text fz="sm" fw={600} lh={1.4}>
                        Hierarki
                      </Text>
                      <Text fz="sm" fw={500} lh={1.4}>
                        {item.hierarki || '-'}
                      </Text>
                    </Box>
                    <Group justify="flex-end" gap="xs" mt="xs">
                      <Button
                        variant="light"
                        color="green"
                        size="xs"
                        onClick={() =>
                          router.push(
                            `/admin/ekonomi/Struktur-Organisasi-Dan-Sk-Pengurus-BumDes/posisi-organisasi/${item.id}`
                          )
                        }
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
                <Text c="dimmed" fz="sm" lh={1.4}>
                  Tidak ada data posisi organisasi yang cocok
                </Text>
              </Center>
            )}
          </Stack>
        </Box>
      </Paper>

      {totalPages > 1 && (
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
      )}

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