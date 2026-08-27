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
import { IconDeviceImacCog, IconPlus, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../_com/header';
import pencegahanKriminalitasState from '../../_state/keamanan/pencegahan-kriminalitas';

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

function PencegahanKriminalitas() {
  const [search, setSearch] = useState("");

  return (
    <Box>
      {/* Header Search */}
      <HeaderSearch
        title='Pencegahan Kriminalitas'
        placeholder='Cari nama, slug, atau deskripsi...'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />

      <ListPencegahanKriminalitas search={search} />
    </Box>
  );
}

function ListPencegahanKriminalitas({ search }: { search: string }) {
  const kriminalitasState = useProxy(pencegahanKriminalitasState);
  const router = useRouter();
  const [debouncedSearch] = useDebouncedValue(search, 1000);

  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = kriminalitasState.findMany;

  useShallowEffect(() => {
    load(page, 10, debouncedSearch);
  }, [page, debouncedSearch]);

  if (loading || !data) {
    return (
      <Stack py={{ base: 'sm', md: 'md' }}>
        <Skeleton height={600} radius="md" />
      </Stack>
    );
  }

  return (
    <Stack py={{ base: 'sm', md: 'md' }}>
      <Paper withBorder bg={colors['white-1']} p={{ base: 'sm', md: 'lg' }} shadow="md" radius="md">
        {/* Judul + Tombol Tambah */}
        <Group justify="space-between" mb={{ base: 'sm', md: 'md' }}>
          <Title
            order={4}
            lh={{ base: 1.2, md: 1.1 }}
          >
            Daftar Pencegahan Kriminalitas
          </Title>
          <Button
            leftSection={<IconPlus size={18} />}
            color="blue"
            variant="light"
            onClick={() => router.push('/admin/keamanan/pencegahan-kriminalitas/create')}
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
                <TableTh style={{ width: '25%' }}>Nama Pencegahan</TableTh>
                <TableTh style={{ width: '35%' }}>Deskripsi</TableTh>
                <TableTh style={{ width: '25%' }}>Deskripsi Singkat</TableTh>
                <TableTh style={{ width: '15%' }}>Aksi</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {data.length > 0 ? (
                data.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>
                      <Text fz="md" fw={500} lh={1.45} truncate="end" lineClamp={1}>
                        {item.judul}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Text
                        fz="sm"
                        lh={1.45}
                        truncate
                        lineClamp={1}>{toPlainText(item.deskripsi) || '-'}</Text>
                    </TableTd>
                    <TableTd>
                      <Text
                        fz="sm"
                        lh={1.45}
                        truncate
                        lineClamp={1}>{toPlainText(item.deskripsiSingkat) || '-'}</Text>
                    </TableTd>
                    <TableTd>
                      <Button
                        variant="light"
                        color="blue"
                        onClick={() => router.push(`/admin/keamanan/pencegahan-kriminalitas/${item.id}`)}
                      >
                        <IconDeviceImacCog size={20} />
                        <Text ml={5} fz="sm" fw={500} lh={1.4}>
                          Detail
                        </Text>
                      </Button>
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={4}>
                    <Center py={20}>
                      <Text c="dimmed" fz="sm" lh={1.4}>
                        Tidak ada data pencegahan kriminalitas yang cocok
                      </Text>
                    </Center>
                  </TableTd>
                </TableTr>
              )}
            </TableTbody>
          </Table>
        </Box>

        {/* Mobile Card View */}
        <Stack hiddenFrom="md" gap="xs">
          {data.length > 0 ? (
            data.map((item) => (
              <Paper key={item.id} withBorder p="sm" radius="sm">
                <Stack gap={"xs"}>
                  <Box>
                    <Text fz="sm" fw={600} lh={1.4}>
                      Nama Pencegahan
                    </Text>
                    <Text fz="sm" fw={500} lh={1.4}>
                      {item.judul}
                    </Text>
                  </Box>
                  <Box>
                    <Text fz="sm" fw={600} lh={1.4}>
                      Deskripsi Singkat
                    </Text>
                    <Text
                      fz="sm"
                      fw={500}
                      lh={1.4}
                      lineClamp={3}
                      ta="justify">{toPlainText(item.deskripsiSingkat) || '-'}</Text>
                  </Box>
                  <Box>
                    <Text fz="sm" fw={600} lh={1.4}>
                      Deskripsi
                    </Text>
                    <Text
                      fz="sm"
                      fw={500}
                      lh={1.4}
                      lineClamp={3}
                      ta="justify">{toPlainText(item.deskripsi) || '-'}</Text>
                  </Box>
                  <Box>
                    <Button
                      variant="light"
                      color="blue"
                      fullWidth
                      onClick={() => router.push(`/admin/keamanan/pencegahan-kriminalitas/${item.id}`)}
                    >
                      <IconDeviceImacCog size={20} />
                      <Text ml={5} fz="sm" fw={500} lh={1.4}>
                        Detail
                      </Text>
                    </Button>
                  </Box>
                </Stack>
              </Paper>
            ))
          ) : (
            <Center py={20}>
              <Text c="dimmed" fz="sm" lh={1.4}>
                Tidak ada data pencegahan kriminalitas yang cocok
              </Text>
            </Center>
          )}
        </Stack>
      </Paper>

      {/* Pagination */}
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
    </Stack>
  );
}

export default PencegahanKriminalitas;