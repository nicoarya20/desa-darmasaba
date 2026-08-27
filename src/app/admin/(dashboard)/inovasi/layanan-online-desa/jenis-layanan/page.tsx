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
  useMantineTheme
} from '@mantine/core';
import { useDebouncedValue, useShallowEffect } from '@mantine/hooks';
import { IconDeviceImac, IconPlus, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import layananonlineDesa from '../../../_state/inovasi/layanan-online-desa';

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

function JenisLayanan() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      <HeaderSearch
        title="Jenis Layanan"
        placeholder="Cari jenis layanan..."
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListJenisLayanan search={search} />
    </Box>
  );
}

function ListJenisLayanan({ search }: { search: string }) {
  const stateList = useProxy(layananonlineDesa.jenisLayanan);
  const router = useRouter();
  const [debouncedSearch] = useDebouncedValue(search, 1000);

  const { data, page, totalPages, loading, load } = stateList.findMany;

  useShallowEffect(() => {
    load(page, 10, debouncedSearch);
  }, [page, debouncedSearch]);

  const filteredData = data || [];
  const theme = useMantineTheme();

  if (loading || !data) {
    return (
      <Stack py="lg">
        <Skeleton height={600} radius="md" />
      </Stack>
    );
  }

  return (
    <Stack py="lg" gap="xl">
      <Paper withBorder bg={colors['white-1']} p="lg" shadow="md" radius="md">
        <Group justify="space-between" mb="md">
          <Title
            order={4}
            lh={{ base: 1.2, md: 1.15 }}
          >
            Daftar Jenis Layanan
          </Title>
          <Button
            leftSection={<IconPlus size={18} />}
            color="blue"
            variant="light"
            onClick={() =>
              router.push(
                '/admin/inovasi/layanan-online-desa/jenis-layanan/create'
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
                <TableTh style={{ width: '30%' }}>
                  <Text fz="sm" fw={600} lh={1.4} c={theme.black}>
                    Nama Jenis Layanan
                  </Text>
                </TableTh>
                <TableTh style={{ width: '55%' }}>
                  <Text fz="sm" fw={600} lh={1.4} c={theme.black}>
                    Deskripsi
                  </Text>
                </TableTh>
                <TableTh style={{ width: '15%' }}>
                  <Text fz="sm" fw={600} lh={1.4} ta="center" c={theme.black}>
                    Aksi
                  </Text>
                </TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd style={{ width: '30%' }}>
                      <Text
                        fz="md"
                        fw={500}
                        lh={1.5}
                        c={theme.black}
                        truncate="end"
                        lineClamp={1}
                      >
                        {item.nama}
                      </Text>
                    </TableTd>
                    <TableTd style={{ width: '55%' }}>
                      <Text
                        fz="sm"
                        fw={500}
                        lh={1.5}
                        c={theme.black}
                        lineClamp={2}>{toPlainText(item.deskripsi) || '-'}</Text>
                    </TableTd>
                    <TableTd style={{ width: '15%' }} ta="center">
                      <Button
                        size="xs"
                        radius="md"
                        variant="light"
                        color="blue"
                        leftSection={<IconDeviceImac size={16} />}
                        onClick={() =>
                          router.push(
                            `/admin/inovasi/layanan-online-desa/jenis-layanan/${item.id}`
                          )
                        }
                      >
                        Detail
                      </Button>
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={3}>
                    <Center py="xl">
                      <Text c="dimmed" fz="sm" lh={1.4}>
                        Tidak ada jenis layanan yang cocok
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
                <Paper key={item.id} withBorder radius="md" p="md">
                  <Stack gap="xs">
                    <Box pl={5}>
                      <Text fz="sm" fw={600} lh={1.4} c={theme.black}>
                        Nama Jenis Layanan
                      </Text>
                      <Text fz="sm" fw={500} lh={1.5} c={theme.black}>
                        {item.nama}
                      </Text>
                    </Box>
                    <Box pl={5}>
                      <Text fz="sm" fw={600} lh={1.4} c={theme.black}>
                        Deskripsi
                      </Text>
                      <Text 
                        fz="sm" 
                        fw={500} 
                        lh={1.5} 
                        c={theme.black}
                        dangerouslySetInnerHTML={{ __html: item.deskripsi || '-' }}
                      />
                    </Box>
                    <Group justify="flex-end" mt="xs">
                      <Button
                        size="xs"
                        radius="md"
                        variant="light"
                        color="blue"
                        leftSection={<IconDeviceImac size={16} />}
                        onClick={() =>
                          router.push(
                            `/admin/inovasi/layanan-online-desa/jenis-layanan/${item.id}`
                          )
                        }
                      >
                        Detail
                      </Button>
                    </Group>
                  </Stack>
                </Paper>
              ))
            ) : (
              <Center py="xl">
                <Text c="dimmed" fz="sm" lh={1.4}>
                  Tidak ada jenis layanan yang cocok
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
            color="blue"
            radius="md"
          />
        </Center>
    </Stack>
  );
}

export default JenisLayanan;
