/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import colors from '@/con/colors';
import {
  Box,
  Button,
  Center,
  Group,
  Image,
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
  Tooltip,
} from '@mantine/core';
import { IconEdit, IconSearch, IconX, IconPlus } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import mitraKolaborasi from '../../../_state/inovasi/mitra-kolaborasi';
import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';

function MitraKolaborasi() {
  const [search, setSearch] = useState('');
  return (
    <Box>
      <HeaderSearch
        title="Mitra Kolaborasi"
        placeholder="Cari nama mitra..."
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListMitraKolaborasi search={search} />
    </Box>
  );
}

function ListMitraKolaborasi({ search }: { search: string }) {
  const listState = useProxy(mitraKolaborasi);
  const router = useRouter();
  const [modalHapus, setModalHapus] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleHapus = () => {
    if (selectedId) {
      mitraKolaborasi.delete.byId(selectedId);
      setModalHapus(false);
      setSelectedId(null);
      router.push('/admin/inovasi/kolaborasi-inovasi');
    }
  };

  const { data, loading, page, totalPages, load } = listState.findMany;

  useEffect(() => {
    load(page, 10, search);
  }, [page, search]);

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
          <Title order={4}>Daftar Mitra Kolaborasi</Title>
          <Tooltip label="Tambah Mitra Baru" withArrow>
            <Button
              leftSection={<IconPlus size={18} />}
              color="blue"
              variant="light"
              onClick={() =>
                router.push(
                  '/admin/inovasi/kolaborasi-inovasi/mitra-kolaborasi/create'
                )
              }
            >
              Tambah Baru
            </Button>
          </Tooltip>
        </Group>
        <Box style={{ overflowX: 'auto' }}>
          <Table highlightOnHover>
            <TableThead>
              <TableTr>
                <TableTh style={{ width: '10%' }}>No</TableTh>
                <TableTh style={{ width: '30%' }}>Nama Mitra</TableTh>
                <TableTh style={{ width: '25%' }}>Image</TableTh>
                <TableTh style={{ width: '15%' }}>Delete</TableTh>
                <TableTh style={{ width: '15%' }}>Edit</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item, index) => (
                  <TableTr key={item.id}>
                    <TableTd>{index + 1}</TableTd>
                    <TableTd>
                      <Text fw={500} truncate="end" lineClamp={1}>
                        {item.name}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Box
                        w={70}
                        h={70}
                      >
                        {item.image?.link ? (
                          <Image
                            loading="lazy"
                            src={item.image.link}
                            alt={item.name}
                            fit="cover"
                          />
                        ) : (
                          <Box bg={colors['blue-button']} w="100%" h="100%" />
                        )}
                      </Box>
                    </TableTd>
                    <TableTd>
                      <Tooltip label="Hapus Mitra" withArrow>
                        <Button
                          size="xs"
                          radius="md"
                          variant="light"
                          color="red"
                          disabled={mitraKolaborasi.delete.loading || !item}
                          onClick={() => {
                            setSelectedId(item.id);
                            setModalHapus(true);
                          }}
                        >
                          <IconX size={16} />
                        </Button>
                      </Tooltip>
                    </TableTd>
                    <TableTd>
                      <Tooltip label="Edit Mitra" withArrow>
                        <Button
                          size="xs"
                          radius="md"
                          variant="light"
                          color="green"
                          disabled={!item}
                          onClick={() =>
                            router.push(
                              `/admin/inovasi/kolaborasi-inovasi/mitra-kolaborasi/${item.id}`
                            )
                          }
                        >
                          <IconEdit size={16} />
                        </Button>
                      </Tooltip>
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={5}>
                    <Center py={20}>
                      <Text color="dimmed">
                        Tidak ada data mitra kolaborasi yang tersedia
                      </Text>
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
        text="Apakah anda yakin ingin menghapus mitra kolaborasi ini?"
      />
    </Box>
  );
}

export default MitraKolaborasi;
