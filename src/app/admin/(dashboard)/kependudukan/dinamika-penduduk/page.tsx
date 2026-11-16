'use client'
import colors from '@/con/colors';
import { DINAMIKA_FIELDS, type DinamikaRow } from '@/lib/dinamika-penduduk';
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
import { IconEdit, IconPlus, IconTrash } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import { ModalKonfirmasiHapus } from '../../_com/modalKonfirmasiHapus';
import dinamikaPenduduk from '../../_state/kependudukan/dinamika-penduduk';

const BASE_PATH = '/admin/kependudukan/dinamika-penduduk';
const EMPTY_TEXT = 'Belum ada data dinamika penduduk';
const fmt = (n: number) => n.toLocaleString('id-ID');

function DinamikaPendudukAdmin() {
  const router = useRouter();
  const state = useProxy(dinamikaPenduduk);
  const [selected, setSelected] = useState<DinamikaRow | null>(null);
  const { data, page, totalPages, loading } = state.findMany;

  useShallowEffect(() => {
    dinamikaPenduduk.findMany.load(1);
  }, []);

  const rows = (data as DinamikaRow[] | null) ?? [];

  const handleDelete = async () => {
    if (!selected) return;
    const id = selected.id;
    setSelected(null);
    await dinamikaPenduduk.delete.byId(id);
  };

  const actions = (item: DinamikaRow, size: number) => (
    <>
      <Button variant="light" color="green" onClick={() => router.push(`${BASE_PATH}/${item.id}`)} px="xs" aria-label={`Edit tahun ${item.tahun}`}>
        <IconEdit size={size} />
      </Button>
      <Button variant="light" color="red" disabled={state.delete.loading} onClick={() => setSelected(item)} px="xs" aria-label={`Hapus tahun ${item.tahun}`}>
        <IconTrash size={size} />
      </Button>
    </>
  );

  return (
    <Box py={{ base: 'sm', md: 'md' }}>
      <Paper withBorder bg={colors['white-1']} p={{ base: 'md', md: 'lg' }} shadow="md" radius="md">
        <Group justify="space-between" mb={{ base: 'sm', md: 'md' }}>
          <Box>
            <Title order={4}>Dinamika Penduduk</Title>
            <Text fz="sm" c="dimmed">Total kelahiran, kematian, dan perpindahan penduduk per tahun</Text>
          </Box>
          <Button leftSection={<IconPlus size={18} />} color="blue" variant="light" onClick={() => router.push(`${BASE_PATH}/create`)}>
            Tambah Baru
          </Button>
        </Group>

        {loading || !data ? (
          <Skeleton height={300} radius="md" />
        ) : (
          <>
            <Box visibleFrom="md" style={{ overflowX: 'auto' }}>
              <Table highlightOnHover>
                <TableThead>
                  <TableTr>
                    <TableTh>Tahun</TableTh>
                    {DINAMIKA_FIELDS.map((f) => (
                      <TableTh key={f.key}>{f.label}</TableTh>
                    ))}
                    <TableTh>Aksi</TableTh>
                  </TableTr>
                </TableThead>
                <TableTbody>
                  {rows.length > 0 ? (
                    rows.map((item) => (
                      <TableTr key={item.id}>
                        <TableTd fw={600}>{item.tahun}</TableTd>
                        {DINAMIKA_FIELDS.map((f) => (
                          <TableTd key={f.key}>{fmt(item[f.key])}</TableTd>
                        ))}
                        <TableTd>
                          <Group gap="xs">{actions(item, 16)}</Group>
                        </TableTd>
                      </TableTr>
                    ))
                  ) : (
                    <TableTr>
                      <TableTd colSpan={DINAMIKA_FIELDS.length + 2}>
                        <Center py={20}>
                          <Text c="dimmed" fz="sm">{EMPTY_TEXT}</Text>
                        </Center>
                      </TableTd>
                    </TableTr>
                  )}
                </TableTbody>
              </Table>
            </Box>

            <Box hiddenFrom="md">
              <Stack gap="xs">
                {rows.length > 0 ? (
                  rows.map((item) => (
                    <Paper key={item.id} withBorder p="sm" radius="sm">
                      <Group justify="space-between" mb="xs">
                        <Text fw={700}>Tahun {item.tahun}</Text>
                        <Group gap="xs">{actions(item, 14)}</Group>
                      </Group>
                      {DINAMIKA_FIELDS.map((f) => (
                        <Group key={f.key} justify="space-between">
                          <Text fz="sm" c="dimmed">{f.label}</Text>
                          <Text fz="sm" fw={500}>{fmt(item[f.key])}</Text>
                        </Group>
                      ))}
                    </Paper>
                  ))
                ) : (
                  <Center py={20}>
                    <Text c="dimmed" fz="sm">{EMPTY_TEXT}</Text>
                  </Center>
                )}
              </Stack>
            </Box>
          </>
        )}
      </Paper>

      {totalPages > 1 && (
        <Center>
          <Pagination
            value={page}
            onChange={(newPage) => {
              dinamikaPenduduk.findMany.load(newPage);
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

      <ModalKonfirmasiHapus
        opened={selected !== null}
        loading={state.delete.loading}
        onClose={() => setSelected(null)}
        onConfirm={handleDelete}
        text={`Hapus data dinamika penduduk tahun ${selected?.tahun ?? ''}?`}
      />
    </Box>
  );
}

export default DinamikaPendudukAdmin;
