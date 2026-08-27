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
import { IconDeviceImacCog, IconPlus, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import posyandustate from '../../../_state/kesehatan/posyandu/posyandu';

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

function Posyandu() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      <HeaderSearch
        title='Posyandu'
        placeholder='Cari nama posyandu atau nomor...'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListPosyandu search={search} />
    </Box>
  );
}

function ListPosyandu({ search }: { search: string }) {
  const statePosyandu = useProxy(posyandustate);
  const router = useRouter();
  const [debouncedSearch] = useDebouncedValue(search, 1000); // 500ms delay

  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = statePosyandu.findMany;

  useShallowEffect(() => {
    load(page, 10, debouncedSearch);
  }, [page, debouncedSearch]);

  const filteredData = data || [];

  if (loading || !data) {
    return (
      <Stack py={{ base: 'sm', md: 'md' }}>
        <Skeleton height={600} radius="md" />
      </Stack>
    );
  }

  return (
    <Box py={{ base: 'sm', md: 'md' }}>
      <Paper withBorder bg={colors['white-1']} p={{ base: 'sm', md: 'lg' }} shadow="md" radius="md">
        <Group justify="space-between" mb={{ base: 'sm', md: 'md' }}>
          <Title order={4} lh={1.2}>
            Daftar Posyandu
          </Title>
          <Button
            leftSection={<IconPlus size={18} />}
            color="blue"
            variant="light"
            onClick={() => router.push('/admin/kesehatan/posyandu/list-posyandu/create')}
          >
            Tambah Baru
          </Button>
        </Group>

        {/* Desktop Table */}
        <Box visibleFrom="md" style={{ overflowX: 'auto' }}>
          <Table highlightOnHover
            layout="fixed" // 🔥 PENTING
            withColumnBorders={false}
          >
            <TableThead>
              <TableTr>
                <TableTh w={200} fz="sm" fw={600} ta="left" lh={1.4}>Nama Posyandu</TableTh>
                <TableTh w={160} fz="sm" fw={600} ta="left" lh={1.4}>Banjar</TableTh>
                <TableTh w={160} fz="sm" fw={600} ta="left" lh={1.4}>Nomor Posyandu</TableTh>
                <TableTh w={200} fz="sm" fw={600} ta="left" lh={1.4}>Deskripsi</TableTh>
                <TableTh w={120} fz="sm" fw={600} ta="left" lh={1.4}>Aksi</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd w={200}>
                      <Text fz="md" fw={500} lh={1.5} truncate="end" lineClamp={1}>
                        {item.name}
                      </Text>
                    </TableTd>
                    <TableTd w={160}>
                      <Text fz="sm" c={item.banjar ? undefined : 'dimmed'} lh={1.5}>
                        {item.banjar?.name || '-'}
                      </Text>
                    </TableTd>
                    <TableTd w={160}>
                      <Text fz="sm" c="dimmed" lh={1.5}>
                        {item.nomor || '-'}
                      </Text>
                    </TableTd>
                    <TableTd w={200}>
                      <Text
                        fz="sm"
                        lh={1.5}
                        lineClamp={1}
                        truncate>{toPlainText(item.deskripsi) || '-'}</Text>
                    </TableTd>
                    <TableTd w={120}>
                      <Button
                        size="xs"
                        radius="md"
                        variant="light"
                        color="blue"
                        leftSection={<IconDeviceImacCog size={16} />}
                        onClick={() => router.push(`/admin/kesehatan/posyandu/list-posyandu/${item.id}`)}
                      >
                        Detail
                      </Button>
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={5}>
                    <Center py={20}>
                      <Text c="dimmed" fz="sm" lh={1.4}>
                        Tidak ada data posyandu yang cocok
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
                <Paper key={item.id} withBorder p="sm" radius="md">
                  <Stack gap={"xs"}>
                    <Box>
                      <Text fz="sm" fw={600} lh={1.4}>
                        Nama Posyandu
                      </Text>
                      <Text fz="sm" fw={500} lh={1.5}>
                        {item.name}
                      </Text>
                    </Box>
                    <Box>
                      <Text fz="sm" fw={600} lh={1.4}>
                        Banjar
                      </Text>
                      <Text fz="sm" fw={500} lh={1.5} c={item.banjar ? undefined : 'dimmed'}>
                        {item.banjar?.name || '-'}
                      </Text>
                    </Box>
                    <Box>
                      <Text fz="sm" fw={600} lh={1.4}>
                        Nomor Posyandu
                      </Text>
                      <Text fz="sm" fw={500} lh={1.5} c={item.nomor ? undefined : 'dimmed'}>
                        {item.nomor || '-'}
                      </Text>
                    </Box>
                    <Box>
                      <Text fz="sm" fw={600} lh={1.4}>
                        Deskripsi
                      </Text>
                      <Text
                        fz="sm"
                        fw={500}
                        lh={1.5}
                        dangerouslySetInnerHTML={{ __html: item.deskripsi }}
                      />
                    </Box>
                    <Button
                      size="xs"
                      radius="md"
                      variant="light"
                      color="blue"
                      leftSection={<IconDeviceImacCog size={16} />}
                      onClick={() => router.push(`/admin/kesehatan/posyandu/list-posyandu/${item.id}`)}
                      fullWidth
                    >
                      Detail
                    </Button>
                  </Stack>
                </Paper>
              ))
            ) : (
              <Center py={20}>
                <Text c="dimmed" fz="sm" lh={1.4}>
                  Tidak ada data posyandu yang cocok
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
    </Box>
  );
}

export default Posyandu;