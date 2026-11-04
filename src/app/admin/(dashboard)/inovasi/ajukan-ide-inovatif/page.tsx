'use client'
import colors from '@/con/colors';
import {
  Box,
  Button,
  Center,
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
import { IconDeviceImac, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../_com/header';
import ajukanIdeInovatifState from '../../_state/inovasi/ajukan-ide-inovatif';

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

function AjukanIdeInovatif() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      <HeaderSearch
        title='Ajukan Ide Inovatif'
        placeholder='Cari ide inovatif...'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListAjukanIdeInovatif search={search} />
    </Box>
  );
}

function ListAjukanIdeInovatif({ search }: { search: string }) {
  const state = useProxy(ajukanIdeInovatifState)
  const router = useRouter()
  const [debouncedSearch] = useDebouncedValue(search, 1000); // 500ms delay

  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = state.findMany;

  useShallowEffect(() => {
    load(page, 10, debouncedSearch)
  }, [page, debouncedSearch])

  const filteredData = data || []

  if (loading || !data) {
    return (
      <Stack py={10}>
        <Skeleton height={500} radius="md" />
      </Stack>
    )
  }

  return (
    <Box py={10}>
      <Paper withBorder bg={colors['white-1']} p="lg" shadow="md" radius="md">
        <Title order={4}>Daftar Ide Inovatif</Title>

        {/* Desktop Table */}
        <Box visibleFrom="md" style={{ overflowX: "auto" }}>
         <Table highlightOnHover
    layout="fixed" // 🔥 PENTING
    withColumnBorders={false}>
            <TableThead>
              <TableTr>
                <TableTh style={{ width: '20%' }}>Nama</TableTh>
                <TableTh style={{ width: '30%' }}>Alamat</TableTh>
                <TableTh style={{ width: '30%' }}>Nama Ide Inovatif</TableTh>
                <TableTh style={{ width: '15%' }}>Aksi</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>
                      <Text fw={500} truncate lineClamp={1}>{item.name}</Text>
                    </TableTd>
                    <TableTd>
                      <Text truncate fz="sm" c="dimmed" lineClamp={1}>{toPlainText(item.alamat) || '-'}</Text>
                    </TableTd>
                    <TableTd>
                      <Text truncate fz="sm" lineClamp={1}>{toPlainText(item.namaIde) || '-'}</Text>
                    </TableTd>
                    <TableTd>
                      <Button
                        size="xs"
                        radius="md"
                        variant="light"
                        color="blue"
                        leftSection={<IconDeviceImac size={16} />}
                        onClick={() => router.push(`/admin/inovasi/ajukan-ide-inovatif/${item.id}`)}
                      >
                        Detail
                      </Button>
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={4}>
                    <Center py={20}>
                      <Text c="dimmed">Tidak ada ide inovatif yang cocok</Text>
                    </Center>
                  </TableTd>
                </TableTr>
              )}
            </TableTbody>
          </Table>
        </Box>

        {/* Mobile Cards */}
        <Box hiddenFrom="md">
          {filteredData.length > 0 ? (
            <Stack gap="md" mt="md">
              {filteredData.map((item) => (
                <Paper key={item.id} p="md" withBorder radius="md">
                  <Stack gap={8}>
                    <Box>
                      <Text fz="sm" fw={600} lh={1.4}>Nama</Text>
                      <Text fz="sm" fw={500} lh={1.4} lineClamp={2}>{item.name}</Text>
                    </Box>
                    <Box>
                      <Text fz="sm" fw={600} lh={1.4}>Alamat</Text>
                      <Text fz="sm" c="dimmed" lh={1.4} lineClamp={2}>{toPlainText(item.alamat) || '-'}</Text>
                    </Box>
                    <Box>
                      <Text fz="sm" fw={600} lh={1.4}>Nama Ide Inovatif</Text>
                      <Text fz="sm" lh={1.4} lineClamp={2}>{toPlainText(item.namaIde) || '-'}</Text>
                    </Box>
                    <Button
                      fullWidth
                      mt={4}
                      size="xs"
                      radius="md"
                      variant="light"
                      color="blue"
                      leftSection={<IconDeviceImac size={16} />}
                      onClick={() => router.push(`/admin/inovasi/ajukan-ide-inovatif/${item.id}`)}
                    >
                      Detail
                    </Button>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          ) : (
            <Center py={20}>
              <Text c="dimmed">Tidak ada ide inovatif yang cocok</Text>
            </Center>
          )}
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
    </Box>
  );
}

export default AjukanIdeInovatif;
