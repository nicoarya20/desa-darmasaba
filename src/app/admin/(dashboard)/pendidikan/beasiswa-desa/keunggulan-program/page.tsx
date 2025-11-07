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
  Title
} from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconEdit, IconPlus, IconSearch, IconTrashFilled } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';
import beasiswaDesaState from '../../../_state/pendidikan/beasiswa-desa';

function KeunggulanProgram() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      <HeaderSearch
        title="List Keunggulan Program"
        placeholder="Cari keunggulan program..."
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListKeunggulanProgram search={search} />
    </Box>
  );
}

function ListKeunggulanProgram({ search }: { search: string }) {
  const stateList = useProxy(beasiswaDesaState.keunggulanProgram);
  const router = useRouter();
  const [modalHapus, setModalHapus] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data, page, totalPages, loading, load } = stateList.findMany;

  useShallowEffect(() => {
    load(page, 10, search);
  }, [page, search]);

  const handleHapus = () => {
    if (selectedId) {
      stateList.delete.delete(selectedId);
      setModalHapus(false);
      setSelectedId(null);
    }
  };

  const filteredData = data || [];

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
          <Title order={4}>Daftar Keunggulan Program</Title>
          <Button
            leftSection={<IconPlus size={18} />}
            color="blue"
            variant="light"
            onClick={() =>
              router.push(
                '/admin/pendidikan/beasiswa-desa/keunggulan-program/create'
              )
            }
          >
            Tambah Baru
          </Button>
        </Group>

        <Box style={{ overflowX: 'auto' }}>
          <Table highlightOnHover>
            <TableThead>
              <TableTr>
                <TableTh style={{ minWidth: 200 }}>Nama Keunggulan Program</TableTh>
                <TableTh style={{ minWidth: 200 }}>Deskripsi</TableTh>
                <TableTh style={{ minWidth: 200 }}>Edit</TableTh>
                <TableTh style={{ minWidth: 200 }}>Delete</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd style={{ minWidth: 200 }}>
                      <Text fw={500} truncate="end" lineClamp={1}>
                        {item.judul}
                      </Text>
                    </TableTd>
                    <TableTd style={{ minWidth: 200 }}>
                      <Text
                        fw={500}
                        truncate="end"
                        lineClamp={1}
                        dangerouslySetInnerHTML={{ __html: item.deskripsi }}
                      />
                    </TableTd>
                    <TableTd style={{ minWidth: 200 }}>
                      <Button
                        variant="light"
                        color="green"
                        size="sm"
                        onClick={() =>
                          router.push(
                            `/admin/pendidikan/beasiswa-desa/keunggulan-program/${item.id}`
                          )
                        }
                      >
                        <IconEdit size={18} />
                      </Button>
                    </TableTd>
                    <TableTd style={{ minWidth: 200 }}>
                      <Button
                        variant="light"
                        color="red"
                        size="sm"
                        onClick={() => {
                          setSelectedId(item.id);
                          setModalHapus(true);
                        }}
                      >
                        <IconTrashFilled size={18} />
                      </Button>
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={4}>
                    <Center py={20}>
                      <Text c="dimmed">
                        Tidak ada data keunggulan program yang cocok
                      </Text>
                    </Center>
                  </TableTd>
                </TableTr>
              )}
            </TableTbody>
          </Table>
        </Box>
      </Paper>

      {totalPages > 1 && (
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
      )}

      {/* Modal Konfirmasi Hapus */}
      <ModalKonfirmasiHapus
        opened={modalHapus}
        onClose={() => setModalHapus(false)}
        onConfirm={handleHapus}
        text="Apakah anda yakin ingin menghapus keunggulan program ini?"
      />
    </Box>
  );
}

export default KeunggulanProgram;
