'use client'
import colors from '@/con/colors';
import { Box, Button, Center, Group, Pagination, Paper, Skeleton, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text, Title } from '@mantine/core';
import { useDebouncedValue, useShallowEffect } from '@mantine/hooks';
import { IconArrowBack, IconDeviceImacCog, IconPlus, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';

import HeaderSearch from '@/app/admin/(dashboard)/_com/header';
import fasilitasKesehatanState from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/fasilitasKesehatan';
import { useState } from 'react';

/**
 * lineClamp Mantine memakai `display: -webkit-box`. Di WebKit (Safari/iOS),
 * clamp gagal kalau isinya mengandung tag blok (<p>, <div>, <ul>, <h1-6>)
 * -- teks tampil penuh dan overlap dengan elemen di bawahnya, tapi hanya
 * di Safari (mis. iPhone X). Jadwal rich-text sering berisi tag blok,
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

function DokterTenagaMedis() {
  const [search, setSearch] = useState("");
  const router = useRouter();
  return (
    <Box>
      <Box mb="sm">
        <Button variant="subtle" onClick={() => router.push('/admin/kesehatan/data-kesehatan-warga/fasilitas_kesehatan')}>
          <IconArrowBack color={colors['blue-button']} size={25} />
        </Button>
      </Box>
      <HeaderSearch
        title='Dokter dan Tenaga Medis'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListDokterTenagaMedis search={search} />
    </Box>
  );
}

function ListDokterTenagaMedis({ search }: { search: string }) {
  const stateFasilitasKesehatan = useProxy(fasilitasKesehatanState.dokter)
  const router = useRouter();
  const {
    data,
    loading,
    load,
    page,
    totalPages
  } = stateFasilitasKesehatan.findMany

  const [debouncedSearch] = useDebouncedValue(search, 1000);

  useShallowEffect(() => {
    load(page, 10, debouncedSearch)
  }, [page, debouncedSearch])

  const filteredData = data || []

  if (loading || !data) {
    return (
      <Box py="md">
        <Skeleton h={500} />
      </Box>
    )
  }

  return (
    <Box py="md">
      <Paper withBorder bg={colors['white-1']} p="lg" shadow="md" radius="md">
        {/* Judul + Tombol Tambah */}
        <Group justify="space-between" mb="md">
          <Title order={3} visibleFrom="md">Daftar Dokter dan Tenaga Medis</Title>
          <Title order={4} hiddenFrom="md">Daftar Dokter dan Tenaga Medis</Title>
          <Button
            leftSection={<IconPlus size={18} />}
            color="blue"
            variant="light"
            onClick={() =>
              router.push(
                '/admin/kesehatan/data-kesehatan-warga/fasilitas_kesehatan/dokter-tenaga-medis/create'
              )
            }
          >
            Tambah Baru
          </Button>
        </Group>

        {/* Desktop Table */}
       <Box visibleFrom="md" style={{ overflowX: 'auto' }}>
         <Table highlightOnHover
    layout="fixed" // 🔥 PENTING
    withColumnBorders={false}>
            <TableThead>
              <TableTr>
                <TableTh><Text fz="sm" fw={600} lh={1.4}>Nama Dokter</Text></TableTh>
                <TableTh><Text fz="sm" fw={600} lh={1.4}>Spesialis</Text></TableTh>
                <TableTh><Text fz="sm" fw={600} lh={1.4}>Jadwal</Text></TableTh>
                <TableTh><Text fz="sm" fw={600} lh={1.4}>Aksi</Text></TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>
                      <Text fz="md" fw={500} lh={1.5} truncate="end" lineClamp={1}>
                        {item.name}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Text fz="md" fw={500} lh={1.5}>
                        {item.specialist || '-'}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Text fz="md" fw={500} lh={1.5} lineClamp={1}>{toPlainText(item.jadwal) || '-'}</Text>
                    </TableTd>
                    <TableTd>
                      <Button
                        variant="light"
                        color="blue"
                        onClick={() =>
                          router.push(
                            `/admin/kesehatan/data-kesehatan-warga/fasilitas_kesehatan/dokter-tenaga-medis/${item.id}`
                          )
                        }
                      >
                        <IconDeviceImacCog size={20} />
                        <Text ml="xs" fz="sm" fw={500}>Detail</Text>
                      </Button>
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={4}>
                    <Center py="xl">
                      <Text c="dimmed" fz="sm" lh={1.4}>
                        Tidak ada fasilitas kesehatan yang cocok
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
          {filteredData.length > 0 ? (
            filteredData.map((item) => (
              <Paper key={item.id} withBorder p="md" mb="xs" radius="sm">
                <Box mb="xs">
                  <Text fz="sm" fw={600} lh={1.4}>Nama Dokter</Text>
                  <Text fz="sm" fw={500} lh={1.5}>{item.name}</Text>
                </Box>
                <Box mb="xs">
                  <Text fz="sm" fw={600} lh={1.4}>Spesialis</Text>
                  <Text fz="sm" fw={500} lh={1.5}>{item.specialist || '-'}</Text>
                </Box>
                <Box mb="md">
                  <Text fz="sm" fw={600} lh={1.4}>Jadwal</Text>
                  <Text fz="sm" fw={500} lh={1.5} lineClamp={2}>{toPlainText(item.jadwal) || '-'}</Text>
                </Box>
                <Button
                  fullWidth
                  variant="light"
                  color="blue"
                  onClick={() =>
                    router.push(
                      `/admin/kesehatan/data-kesehatan-warga/fasilitas_kesehatan/dokter-tenaga-medis/${item.id}`
                    )
                  }
                >
                  <IconDeviceImacCog size={20} />
                  <Text ml="xs" fz="sm" fw={500}>Detail</Text>
                </Button>
              </Paper>
            ))
          ) : (
            <Center py="xl">
              <Text c="dimmed" fz="sm" lh={1.4}>
                Tidak ada fasilitas kesehatan yang cocok
              </Text>
            </Center>
          )}
        </Box>
      </Paper>

      {/* Pagination */}
      <Center>
        <Pagination
          value={page}
          onChange={(newPage) => {
            load(newPage, 10, search);
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
  )
}

export default DokterTenagaMedis;