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
import { useShallowEffect } from '@mantine/hooks';
import { IconEdit, IconPlus, IconSearch, IconTrash } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';
import korupsiState from '../../../_state/landing-page/desa-anti-korupsi';

function KategoriDesaAntiKorupsi() {
  const [search, setSearch] = useState('');
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
  const stateKategori = useProxy(korupsiState.kategoriDesaAntiKorupsi);
  const [modalHapus, setModalHapus] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const router = useRouter();

  const { data, page, totalPages, loading, load } = stateKategori.findMany;

  const handleHapus = () => {
    if (selectedId) {
      stateKategori.delete.byId(selectedId);
      setModalHapus(false);
      setSelectedId(null);
    }
  };

  useShallowEffect(() => {
    load(page, 10, search);
  }, [page, search]);

  const filteredData = data || [];

  if (loading || !data) {
    return (
      <Stack py="xl">
        <Skeleton height={600} radius="md" />
      </Stack>
    );
  }

  // Mobile cards
  const renderMobileCards = () => (
    <Stack gap="md">
      {filteredData.length > 0 ? (
        filteredData.map((item) => (
          <Paper key={item.id} p="md" withBorder>
            <Group justify="space-between" align="flex-start">
              <Box flex={1}>
                <Text fw={500} fz={{ base: 'sm', md: 'md' }} lh={1.45} lineClamp={2}>
                  {item.name}
                </Text>
              </Box>
              <Group gap="xs" wrap="nowrap">
                <Button
                  variant="light"
                  color="green"
                  size="xs"
                  onClick={() => router.push(`/admin/landing-page/desa-anti-korupsi/kategori-desa-anti-korupsi/${item.id}`)}
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
            </Group>
          </Paper>
        ))
      ) : (
        <Paper p="xl" ta="center">
          <Text c="dimmed" fz="sm" lh={1.4}>
            Tidak ada data kategori yang ditemukan
          </Text>
        </Paper>
      )}
    </Stack>
  );

  // Desktop table
  const renderDesktopTable = () => (
    <Box>
      <Table highlightOnHover striped verticalSpacing="sm" miw={300}>
        <TableThead>
          <TableTr>
            <TableTh>
              <Text fw={600} fz="sm" c="dimmed">
                Nama Kategori
              </Text>
            </TableTh>
            <TableTh>
              <Text fw={600} fz="sm" c="dimmed">
                Edit
              </Text>
            </TableTh>
            <TableTh>
              <Text fw={600} fz="sm" c="dimmed">
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
                  <Text fw={500} fz="md" lh={1.45} lineClamp={1}>
                    {item.name}
                  </Text>
                </TableTd>
                <TableTd w={60}>
                  <Button
                    variant="light"
                    color="green"
                    size="sm"
                    onClick={() => router.push(`/admin/landing-page/desa-anti-korupsi/kategori-desa-anti-korupsi/${item.id}`)}
                  >
                    <IconEdit size={18} />
                  </Button>
                </TableTd>
                <TableTd w={60}>
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
              <TableTd colSpan={3} ta="center" py="xl">
                <Text c="dimmed" fz="sm" lh={1.4}>
                  Tidak ada data kategori yang ditemukan
                </Text>
              </TableTd>
            </TableTr>
          )}
        </TableTbody>
      </Table>
    </Box>
  );

  return (
    <Box py={{ base: 'xl', md: 'xl' }}>
      <Paper bg={colors['white-1']} p={{ base: 'md', md: 'xl' }} shadow="md" radius="md">
        <Group justify="space-between" mb={{ base: 'md', md: 'lg' }}>
          <Title order={2} lh={1.2}>
            Daftar Kategori Kegiatan
          </Title>
          <Button
            leftSection={<IconPlus size={18} />}
            color="blue"
            variant="light"
            onClick={() => router.push('/admin/landing-page/desa-anti-korupsi/kategori-desa-anti-korupsi/create')}
          >
            Tambah Baru
          </Button>
        </Group>

        <Box visibleFrom="md">{renderDesktopTable()}</Box>
        <Box hiddenFrom="md">{renderMobileCards()}</Box>
      </Paper>

      {totalPages > 1 && (
        <Center mt="xl">
          <Pagination
            value={page}
            onChange={(newPage) => {
              load(newPage, 10);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            total={totalPages}
            color="blue"
            radius="md"
          />
        </Center>
      )}

      <ModalKonfirmasiHapus
        opened={modalHapus}
        onClose={() => setModalHapus(false)}
        onConfirm={handleHapus}
        text='Apakah anda yakin ingin menghapus kategori kegiatan ini?'
      />
    </Box>
  );
}

export default KategoriDesaAntiKorupsi;