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
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconEdit, IconPlus, IconSearch, IconTrash, IconX } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';
import mitraKolaborasi from '../../../_state/inovasi/mitra-kolaborasi';

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
    }
  };

  const [debouncedSearch] = useDebouncedValue(search, 1000);

  const { data, loading, page, totalPages, load } = listState.findMany;

  useEffect(() => {
    load(page, 10, debouncedSearch);
  }, [page, debouncedSearch]);

  const filteredData = data || [];

  if (loading || !data) {
    return (
      <Stack py="lg">
        <Skeleton height={600} radius="md" />
      </Stack>
    );
  }

  return (
    <Box py="lg">
      <Paper withBorder bg={colors['white-1']} p="lg" shadow="md" radius="md">
        <Group justify="space-between" mb="lg">
          <Title
            order={4}
            lh={{ base: 1.2, md: 1.15 }}
          >
            Daftar Mitra Kolaborasi
          </Title>
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
                <TableTh style={{ width: '10%' }}>
                  <Text fz={{ base: 'sm', md: 'md' }} fw={600} lh={1.4}>
                    No
                  </Text>
                </TableTh>
                <TableTh style={{ width: '30%' }}>
                  <Text fz={{ base: 'sm', md: 'md' }} fw={600} lh={1.4}>
                    Nama Mitra
                  </Text>
                </TableTh>
                <TableTh style={{ width: '25%' }}>
                  <Text fz={{ base: 'sm', md: 'md' }} fw={600} lh={1.4}>
                    Image
                  </Text>
                </TableTh>
                <TableTh style={{ width: '15%' }}>
                  <Text fz={{ base: 'sm', md: 'md' }} fw={600} lh={1.4}>
                    Delete
                  </Text>
                </TableTh>
                <TableTh style={{ width: '15%' }}>
                  <Text fz={{ base: 'sm', md: 'md' }} fw={600} lh={1.4}>
                    Edit
                  </Text>
                </TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item, index) => (
                  <TableTr key={item.id}>
                    <TableTd>
                      <Text fz={{ base: 'xs', md: 'sm' }} fw={500} lh={1.5}>
                        {index + 1}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Text
                        fz={{ base: 'sm', md: 'md' }}
                        fw={500}
                        lh={1.5}
                        truncate="end"
                        lineClamp={1}
                      >
                        {item.name}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Box w={70} h={70}>
                        {item.image?.link ? (
                          <Image
                            loading="lazy"
                            src={item.image.link}
                            alt={item.name}
                            fit="cover"
                            radius="sm"
                          />
                        ) : (
                          <Box
                            bg={colors['blue-button']}
                            w="100%"
                            h="100%"
                          />
                        )}
                      </Box>
                    </TableTd>
                    <TableTd>
                      <Button
                        size="xs"
                        radius="md"
                        variant="light"
                        color="red"
                        disabled={listState.delete.loading || !item}
                        onClick={() => {
                          setSelectedId(item.id);
                          setModalHapus(true);
                        }}
                      >
                        <IconTrash size={16} />
                      </Button>
                    </TableTd>
                    <TableTd>
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
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={5}>
                    <Center py="xl">
                      <Text c="dimmed" fz="sm" ta="center">
                        Tidak ada data mitra kolaborasi yang tersedia
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
          <Stack gap="xs">
            {filteredData.length > 0 ? (
              filteredData.map((item, index) => (
                <Paper key={item.id} withBorder p="md" radius="md">
                  <Stack gap={"xs"}>
                    <Box>
                      <Text fz="sm" fw={600} lh={1.4}>
                        No
                      </Text>
                      <Text fz="sm" fw={500} lh={1.4}>
                        {index + 1}
                      </Text>
                    </Box>
                    <Box>
                      <Text fz="sm" fw={600} lh={1.4}>
                        Nama Mitra
                      </Text>
                      <Text fz="sm" fw={500} lh={1.4}>
                        {item.name}
                      </Text>
                    </Box>
                    <Box>
                      <Text fz="sm" fw={600} lh={1.4}>
                        Image
                      </Text>
                      <Box w="100%" h={60} mt="xs">
                        {item.image?.link ? (
                          <Image
                            loading="lazy"
                            src={item.image.link}
                            alt={item.name}
                            fit="cover"
                            radius="sm"
                            h="100%"
                          />
                        ) : (
                          <Box
                            bg={colors['blue-button']}
                            w="100%"
                            h="100%"
                          />
                        )}
                      </Box>
                    </Box>
                    <Group justify="flex-end" mt="md" gap="xs">
                      <Button
                        size="xs"
                        radius="md"
                        variant="light"
                        color="red"
                        disabled={listState.delete.loading || !item}
                        onClick={() => {
                          setSelectedId(item.id);
                          setModalHapus(true);
                        }}
                      >
                        <IconX size={16} />
                      </Button>
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
                    </Group>
                  </Stack>
                </Paper>
              ))
            ) : (
              <Center py="xl">
                <Text c="dimmed" fz="sm" ta="center">
                  Tidak ada data mitra kolaborasi yang tersedia
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
          mt="lg"
          mb="lg"
          color="blue"
          radius="md"
        />
      </Center>

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