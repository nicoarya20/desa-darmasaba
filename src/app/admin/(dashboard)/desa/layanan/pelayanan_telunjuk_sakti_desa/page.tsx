/* eslint-disable react-hooks/exhaustive-deps */
'use client';

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
import { IconDeviceImacCog, IconPlus, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import stateLayananDesa from '../../../_state/desa/layananDesa';
import { useDebouncedValue } from '@mantine/hooks';

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

function PelayananTelunjukSakti() {
  const [search, setSearch] = useState('');
  return (
    <Box>
      <HeaderSearch
        title="Pelayanan Telunjuk Sakti"
        placeholder="Cari layanan..."
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListPelayananTelunjukSakti search={search} />
    </Box>
  );
}

function ListPelayananTelunjukSakti({ search }: { search: string }) {
  const telunjukSaktiState = useProxy(stateLayananDesa.pelayananTelunjukSaktiDesa);
  const router = useRouter();
  const [debouncedSearch] = useDebouncedValue(search, 1000);

  const { data, page, totalPages, loading, load } = telunjukSaktiState.findMany;

  useEffect(() => {
    load(page, 10, debouncedSearch);
  }, [page, debouncedSearch]);

  const filteredData = data || [];

  if (loading || !data) {
    return (
      <Stack py={{ base: 'sm', md: 'md' }}>
        <Skeleton height={400} radius="md" />
      </Stack>
    );
  }

  return (
    <Box py={{ base: 'sm', md: 'md' }}>
      <Paper withBorder bg={colors['white-1']} p={{ base: 'md', md: 'lg' }} shadow="md" radius="md">
        <Group justify="space-between" mb="md">
          <Title order={4} lh={1.2}>
            Daftar Pelayanan Telunjuk Sakti
          </Title>
          <Button
            leftSection={<IconPlus size={18} />}
            color="blue"
            variant="light"
            onClick={() =>
              router.push('/admin/desa/layanan/pelayanan_telunjuk_sakti_desa/create')
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
                <TableTh fz="sm" fw={600} ta="left" c="gray.8" w="30%">
                  Nama
                </TableTh>
                <TableTh fz="sm" fw={600} ta="left" c="gray.8" w="40%">
                  Link
                </TableTh>
                <TableTh fz="sm" fw={600} ta="left" c="gray.8" w="30%">
                  Detail
                </TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>
                      <Text fz="sm" fw={500} lh={1.5} truncate="end">
                        {item.name}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <a href={item.link} target="_blank" rel="noopener noreferrer">
                        <Text fz="sm" lh={1.5} lineClamp={1}>{toPlainText(item.deskripsi) || '-'}</Text>
                      </a>
                    </TableTd>
                    <TableTd>
                      <Button
                        variant="light"
                        color="blue"
                        onClick={() =>
                          router.push(
                            `/admin/desa/layanan/pelayanan_telunjuk_sakti_desa/${item.id}`
                          )
                        }
                      >
                        <IconDeviceImacCog size={20} />
                        <Text ml="xs" fz="sm" fw={500}>
                          Detail
                        </Text>
                      </Button>
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={3}>
                    <Center py="lg">
                      <Text c="dimmed" fz="sm" lh={1.5}>
                        Tidak ada data layanan yang cocok
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
            <Stack gap="md">
              {filteredData.map((item) => (
                <Paper key={item.id} withBorder p="md" radius="sm">
                  <Box mb="xs">
                    <Text fz='sm' fw={600} lh={1.4} c="gray.8">
                      Nama
                    </Text>
                    <Text fz="sm" fw={500} lh={1.5}>
                      {item.name}
                    </Text>
                  </Box>
                  <Box mb="xs">
                    <Text fz='sm' fw={600} lh={1.4} c="gray.8">
                      Link
                    </Text>
                    <Text fz="sm" fw={500} lh={1.5} lineClamp={2} component="a" href={item.link} target="_blank" rel="noopener noreferrer">
                      {toPlainText(item.deskripsi) || '-'}
                    </Text>
                  </Box>
                  <Button
                    variant="light"
                    color="blue"
                    fullWidth
                    mt="sm"
                    onClick={() =>
                      router.push(
                        `/admin/desa/layanan/pelayanan_telunjuk_sakti_desa/${item.id}`
                      )
                    }
                  >
                    <IconDeviceImacCog size={20} />
                    <Text ml="xs" fz="sm" fw={500}>
                      Detail
                    </Text>
                  </Button>
                </Paper>
              ))}
            </Stack>
          ) : (
            <Center py="lg">
              <Text c="dimmed" fz="sm" lh={1.5}>
                Tidak ada data layanan yang cocok
              </Text>
            </Center>
          )}
        </Box>
      </Paper>

      <Center>
        <Pagination
          value={page}
          onChange={(newPage) => {
            load(newPage, 10, search);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
          }
          total={totalPages}
          mt="md"
          color="blue"
          radius="md"
        />
      </Center>
    </Box>
  );
}

export default PelayananTelunjukSakti;