'use client'
import { ModalKonfirmasiHapus } from '@/app/admin/(dashboard)/_com/modalKonfirmasiHapus';
import stateDokumenPerencanaan, {
  type DokumenPerencanaanItem,
} from '@/app/admin/(dashboard)/_state/desa/dokumenPerencanaan';
import colors from '@/con/colors';
import {
  JENIS_DOKUMEN,
  JENIS_DOKUMEN_LABEL,
  formatPeriodeDokumen,
  isJenisDokumen,
} from '@/lib/dokumen-perencanaan';
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Center,
  Group,
  Pagination,
  Paper,
  ScrollArea,
  SegmentedControl,
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
import { IconEdit, IconExternalLink, IconPlus, IconSearch, IconTrash } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';

const BASE_PATH = '/admin/desa/kegiatan-desa/dokumen-perencanaan';
const FILTER_ALL = 'semua';
const filterOptions = [
  { value: FILTER_ALL, label: 'Semua' },
  ...JENIS_DOKUMEN.map((v) => ({ value: v, label: JENIS_DOKUMEN_LABEL[v] })),
];

/** Admin: daftar Dokumen Perencanaan (RPJM/RKP/Berita Acara) dengan filter jenis, cari, edit, hapus. */
export default function DokumenPerencanaanAdmin() {
  const [search, setSearch] = useState('');
  return (
    <Box>
      <HeaderSearch
        title="Dokumen Perencanaan"
        placeholder="Cari judul atau nomor Perdes..."
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <DokumenList search={search} />
    </Box>
  );
}

function DokumenList({ search }: { search: string }) {
  const state = useProxy(stateDokumenPerencanaan);
  const router = useRouter();
  const [debouncedSearch] = useDebouncedValue(search, 800);
  const [filter, setFilter] = useState(FILTER_ALL);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, page, totalPages, loading, load } = state.findMany;
  const jenis = filter === FILTER_ALL ? '' : filter;

  useShallowEffect(() => {
    load(1, debouncedSearch, jenis);
  }, [debouncedSearch, jenis]);

  const handleDelete = async () => {
    if (!deleteId) return;
    await stateDokumenPerencanaan.delete.byId(deleteId);
    setDeleteId(null);
  };

  return (
    <Box py="md">
      <Paper withBorder bg={colors['white-1']} p="lg" shadow="md" radius="md">
        <Group justify="space-between" mb="md">
          <Title order={4}>Daftar Dokumen Perencanaan</Title>
          <Button
            leftSection={<IconPlus size={18} />}
            color="blue"
            variant="light"
            onClick={() => router.push(`${BASE_PATH}/create`)}
          >
            Tambah Baru
          </Button>
        </Group>

        <ScrollArea type="never" mb="md">
          <SegmentedControl data={filterOptions} value={filter} onChange={setFilter} radius="lg" />
        </ScrollArea>

        {loading ? (
          <Skeleton height={400} radius="md" />
        ) : data.length === 0 ? (
          <Center py="xl">
            <Text c="dimmed" fz="sm">Belum ada dokumen perencanaan{jenis ? ' untuk jenis ini' : ''}.</Text>
          </Center>
        ) : (
          <Box style={{ overflowX: 'auto' }}>
            <Table highlightOnHover miw={640}>
              <TableThead>
                <TableTr>
                  <TableTh>Judul</TableTh>
                  <TableTh w={170}>Jenis</TableTh>
                  <TableTh w={110}>Periode/Tahun</TableTh>
                  <TableTh w={130}>Aksi</TableTh>
                </TableTr>
              </TableThead>
              <TableTbody>
                {data.map((item: DokumenPerencanaanItem) => (
                  <TableTr key={item.id}>
                    <TableTd>
                      <Text fw={600} lineClamp={2}>{item.judul}</Text>
                      {item.nomorPerdes && <Text fz="xs" c="dimmed">{item.nomorPerdes}</Text>}
                    </TableTd>
                    <TableTd>
                      <Badge variant="light">
                        {isJenisDokumen(item.jenis) ? JENIS_DOKUMEN_LABEL[item.jenis] : item.jenis}
                      </Badge>
                    </TableTd>
                    <TableTd>{formatPeriodeDokumen(item)}</TableTd>
                    <TableTd>
                      <Group gap="xs" wrap="nowrap">
                        {item.file && (
                          <ActionIcon
                            component="a"
                            href={item.file.link}
                            target="_blank"
                            rel="noreferrer"
                            variant="light"
                            aria-label={`Buka PDF ${item.judul}`}
                          >
                            <IconExternalLink size={18} />
                          </ActionIcon>
                        )}
                        <ActionIcon
                          variant="light"
                          color="blue"
                          aria-label={`Edit ${item.judul}`}
                          onClick={() => router.push(`${BASE_PATH}/${item.id}/edit`)}
                        >
                          <IconEdit size={18} />
                        </ActionIcon>
                        <ActionIcon
                          variant="light"
                          color="red"
                          aria-label={`Hapus ${item.judul}`}
                          onClick={() => setDeleteId(item.id)}
                        >
                          <IconTrash size={18} />
                        </ActionIcon>
                      </Group>
                    </TableTd>
                  </TableTr>
                ))}
              </TableTbody>
            </Table>
          </Box>
        )}

        {totalPages > 1 && (
          <Center mt="md">
            <Pagination value={page} onChange={(p) => load(p, debouncedSearch, jenis)} total={totalPages} radius="xl" />
          </Center>
        )}
      </Paper>

      <ModalKonfirmasiHapus
        opened={deleteId !== null}
        loading={state.delete.loading}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        text="Apakah Anda yakin ingin menghapus dokumen perencanaan ini?"
      />
    </Box>
  );
}
