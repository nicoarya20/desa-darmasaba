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
import { useDebouncedValue, useShallowEffect } from '@mantine/hooks';
import { IconEdit, IconPlus, IconSearch, IconTrashFilled } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';
import beasiswaDesaState from '../../../_state/pendidikan/beasiswa-desa';

/**
 * lineClamp Mantine memakai `display: -webkit-box`. Di WebKit (Safari/iOS),
 * clamp gagal kalau isinya mengandung tag blok (<p>, <div>, <ul>, <h1-6>)
 * -- teks tampil penuh dan overlap dengan elemen di bawahnya, tapi hanya
 * di Safari (mis. iPhone X). Deskripsi rich-text sering berisi tag blok,
 * jadi harus diratakan jadi plain text dulu sebelum di-clamp.
 *
 * Regex dipakai (bukan DOMParser) supaya tetap aman saat SSR. Pola sama
 * dengan fix di src/app/admin/(dashboard)/landing-page/profil/program-inovasi/page.tsx
 */
function toPlainText(html?: string | null) {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/(p|div|li|h[1-6]|tr)>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

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
  const [debouncedSearch] = useDebouncedValue(search, 1000);

  const { data, page, totalPages, loading, load } = stateList.findMany;

  useShallowEffect(() => {
    load(page, 10, debouncedSearch);
  }, [page, debouncedSearch]);

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
      <Stack py="md">
        <Skeleton height={600} radius="md" />
      </Stack>
    );
  }

  return (
    <Box py="md">
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
                <TableTh style={{ width: '30%' }}>Nama Keunggulan Program</TableTh>
                <TableTh style={{ width: '40%' }}>Deskripsi</TableTh>
                <TableTh style={{ width: '15%' }}>Edit</TableTh>
                <TableTh style={{ width: '15%' }}>Delete</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>
                      <Text fz="md" fw={500} lh={1.45} truncate="end" lineClamp={1}>
                        {item.judul}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Text
                        fz="md"
                        fw={500}
                        lh={1.45}
                        truncate="end"
                        lineClamp={1}>{toPlainText(item.deskripsi) || '-'}</Text>
                    </TableTd>
                    <TableTd>
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
                        <IconTrashFilled size={18} />
                      </Button>
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={4}>
                    <Center py="xl">
                      <Text c="dimmed" fz="sm" lh={1.4}>
                        Tidak ada data keunggulan program yang cocok
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
          <Stack gap="sm">
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <Paper key={item.id} withBorder p="md" radius="sm">
                  <Stack gap={"xs"}>
                    <Box>
                      <Text fz="sm" fw={600} lh={1.4}>Nama Keunggulan Program</Text>
                      <Text fz="sm" fw={500} lh={1.4} truncate="end">
                        {item.judul}
                      </Text>
                    </Box>
                    <Box>
                      <Text fz="sm" fw={600} lh={1.4}>Deskripsi</Text>
                      <Text
                        fz="sm"
                        fw={500}
                        lh={1.4}
                        lineClamp={2}
                      >{toPlainText(item.deskripsi) || '-'}</Text>
                    </Box>
                    <Group justify="flex-end" mt="xs">
                      <Button
                        variant="light"
                        color="green"
                        size="xs"
                        onClick={() =>
                          router.push(
                            `/admin/pendidikan/beasiswa-desa/keunggulan-program/${item.id}`
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
                        <IconTrashFilled size={16} />
                      </Button>
                    </Group>
                  </Stack>
                </Paper>
              ))
            ) : (
              <Center py="xl">
                <Text c="dimmed" fz="sm" lh={1.4}>
                  Tidak ada data keunggulan program yang cocok
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
            mt="md"
            mb="md"
            color="blue"
            radius="md"
          />
        </Center>

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