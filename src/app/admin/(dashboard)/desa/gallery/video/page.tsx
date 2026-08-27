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
import { IconDeviceImac, IconPlus, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import stateGallery from '../../../_state/desa/gallery';

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

function Video() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      <HeaderSearch
        title='Video'
        placeholder='Cari judul atau deskripsi video...'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListVideo search={search} />
    </Box>
  );
}

function ListVideo({ search }: { search: string }) {
  const videoState = useProxy(stateGallery.video)
  const router = useRouter();
  const [debouncedSearch] = useDebouncedValue(search, 1000);

  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = videoState.findMany;

  useShallowEffect(() => {
    load(page, 10, debouncedSearch)
  }, [page, debouncedSearch])

  const filteredData = data || []

  if (loading || !data) {
    return (
      <Stack py={20}>
        <Skeleton height={600} radius="md" />
      </Stack>
    )
  }

  return (
    <Box py={20}>
      <Paper withBorder bg={colors['white-1']} p={{ base: 'sm', md: 'lg' }} shadow="md" radius="md">
        <Group justify="space-between" mb={{ base: 'sm', md: 'md' }}>
          <Title order={4} lh={1.2}>
            Daftar Video
          </Title>
          <Button
            leftSection={<IconPlus size={18} />}
            color="blue"
            variant="light"
            onClick={() => router.push('/admin/desa/gallery/video/create')}
          >
            Tambah Baru
          </Button>
        </Group>

        {/* Desktop Table */}
        <Box visibleFrom="md" style={{ overflowX: 'auto' }}>
         <Table highlightOnHover
    layout="fixed" // 🔥 PENTING
    withColumnBorders={false} striped verticalSpacing="sm">
            <TableThead>
              <TableTr>
                <TableTh>Judul Video</TableTh>
                <TableTh>Tanggal</TableTh>
                <TableTh>Deskripsi</TableTh>
                <TableTh>Aksi</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd style={{ maxWidth: 250 }}>
                      <Text fz="md" fw={500} lh={1.45} truncate="end" lineClamp={1}>
                        {item.name}
                      </Text>
                    </TableTd>
                    <TableTd style={{ maxWidth: 250 }}>
                      <Text fz="sm" c="dimmed" lh={1.45}>
                        {new Date(item.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </Text>
                    </TableTd>
                    <TableTd style={{ maxWidth: 250 }}>
                      <Text fz="sm" lh={1.45} truncate="end" lineClamp={1}>{toPlainText(item.deskripsi) || '-'}</Text>
                    </TableTd>
                    <TableTd style={{ maxWidth: 250 }}>
                      <Button
                        variant="light"
                        color="blue"
                        onClick={() => router.push(`/admin/desa/gallery/video/${item.id}`)}
                        fz="sm"
                        px="xs"
                      >
                        <IconDeviceImac size={18} />
                        <Text ml={5}>Detail</Text>
                      </Button>
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={4}>
                    <Center py={24}>
                      <Text c="dimmed" fz="sm" lh={1.4}>
                        Tidak ada video yang cocok
                      </Text>
                    </Center>
                  </TableTd>
                </TableTr>
              )}
            </TableTbody>
          </Table>
        </Box>

        {/* Mobile Cards */}
        <Stack hiddenFrom="md" gap="xs" mt="sm">
          {filteredData.length > 0 ? (
            filteredData.map((item) => (
              <Paper key={item.id} p="sm" withBorder radius="sm">
                <Stack gap={"xs"}>
                  <Box>
                    <Text fz="xs" fw={600} lh={1.4}>Judul Video</Text>
                    <Text fz="sm" fw={500} lh={1.45}>
                      {item.name}
                    </Text>
                  </Box>
                  <Box>
                    <Text fz="xs" fw={600} lh={1.4}>Tanggal</Text>
                    <Text fz="sm" fw={500} lh={1.45}>
                      {new Date(item.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </Text>
                  </Box>
                  <Box>
                    <Text fz="xs" fw={600} lh={1.4}>Deskripsi</Text>
                    <Text fz="sm" lineClamp={5} fw={500} lh={1.45}>{toPlainText(item.deskripsi) || '-'}</Text>
                  </Box>
                  <Box>
                    <Button
                      variant="light"
                      color="blue"
                      fullWidth
                      onClick={() => router.push(`/admin/desa/gallery/video/${item.id}`)}
                      fz="sm"
                    >
                      <IconDeviceImac size={18} />
                      <Text ml={5}>Detail</Text>
                    </Button>
                  </Box>
                </Stack>
              </Paper>
            ))
          ) : (
            <Center py={24}>
              <Text c="dimmed" fz="sm" lh={1.4}>
                Tidak ada video yang cocok
              </Text>
            </Center>
          )}
        </Stack>
      </Paper>


      <Center mt="xl">
        <Pagination
          value={page}
          onChange={(newPage) => {
            load(newPage, 10)
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
          total={totalPages}
          color="blue"
          radius="md"
        />
      </Center>
    </Box>
  );
}

export default Video;