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
import HeaderSearch from '../../_com/header';
import programKesehatan from '../../_state/kesehatan/program-kesehatan/programKesehatan';

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

function ProgramKesehatan() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      {/* Header dengan Search */}
      <HeaderSearch
        title='Program Kesehatan'
        placeholder='Cari program kesehatan...'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListProgramKesehatan search={search} />
    </Box>
  );
}

function ListProgramKesehatan({ search }: { search: string }) {
  const stateProgram = useProxy(programKesehatan);
  const router = useRouter();

  const { data, page, totalPages, loading, load } = stateProgram.findMany;
  const [debouncedSearch] = useDebouncedValue(search, 1000);

  useShallowEffect(() => {
    load(page, 10, debouncedSearch);
  }, [page, debouncedSearch]);

  const filteredData = data || [];

  if (loading || !data) {
    return (
      <Stack py={{ base: 'md', md: 'lg' }}>
        <Skeleton height={600} radius="md" />
      </Stack>
    );
  }

  return (
    <Box py={{ base: 'md', md: 'lg' }}>
      <Paper withBorder bg={colors['white-1']} p={{ base: 'md', md: 'lg' }} shadow="md" radius="md">
        {/* Header List + Tombol Tambah */}
        <Group justify="space-between" mb={{ base: 'sm', md: 'md' }}>
          <Title order={4} lh={1.2}>
            Daftar Program Kesehatan
          </Title>
          <Button
            leftSection={<IconPlus size={18} />}
            color="blue"
            variant="light"
            onClick={() => router.push('/admin/kesehatan/program-kesehatan/create')}
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
                <TableTh>
                  <Text fz="sm" fw={600} lh={1.4}>Judul</Text>
                </TableTh>
                <TableTh>
                  <Text fz="sm" fw={600} lh={1.4}>Deskripsi Singkat</Text>
                </TableTh>
                <TableTh>
                  <Text fz="sm" fw={600} lh={1.4}>Deskripsi</Text>
                </TableTh>
                <TableTh>
                  <Text fz="sm" fw={600} lh={1.4}>Aksi</Text>
                </TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>
                      <Text fw={500} fz="md" lh={1.5} truncate="end" lineClamp={1}>
                        {item.name}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Text fz="sm" lh={1.5} truncate="end" lineClamp={1}>{toPlainText(item.deskripsiSingkat) || '-'}</Text>
                    </TableTd>
                    <TableTd>
                      <Text fz="sm" lh={1.5} truncate="end" lineClamp={1}>{toPlainText(item.deskripsi) || '-'}</Text>
                    </TableTd>
                    <TableTd>
                      <Button
                        variant="light"
                        color="blue"
                        onClick={() => router.push(`/admin/kesehatan/program-kesehatan/${item.id}`)}
                        size="xs"
                      >
                        <IconDeviceImacCog size={18} />
                        <Text ml={5} fz="sm" fw={500} lh={1.4}>Detail</Text>
                      </Button>
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={4}>
                    <Center py={20}>
                      <Text c="dimmed" fz="sm" lh={1.4}>
                        Tidak ada program kesehatan yang cocok
                      </Text>
                    </Center>
                  </TableTd>
                </TableTr>
              )}
            </TableTbody>
          </Table>
        </Box>

        {/* Mobile Card View */}
        <Box hiddenFrom="md">
          <Stack gap="xs">
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <Paper key={item.id} withBorder p="sm" radius="sm">
                  <Stack gap={'xs'}>
                    <Box>
                      <Text fz="sm" fw={600} lh={1.4}>Judul</Text>
                      <Text fz="sm" fw={500} lh={1.4}>{item.name}</Text>
                    </Box>
                    <Box>
                      <Text fz="sm" fw={600} lh={1.4}>Deskripsi Singkat</Text>
                      <Box pl={10}>
                        <Text fz="sm" lineClamp={3} fw={500} lh={1.4}>{toPlainText(item.deskripsiSingkat) || '-'}</Text>
                      </Box>
                    </Box>
                    <Box>
                      <Text fz="sm" fw={600} lh={1.4}>Deskripsi</Text>
                      <Box pl={10}>
                        <Text fz="sm" lineClamp={3} fw={500} lh={1.4}>{toPlainText(item.deskripsi) || '-'}</Text>
                      </Box>
                    </Box>
                    <Button
                      variant="light"
                      color="blue"
                      fullWidth
                      size="xs"
                      onClick={() => router.push(`/admin/kesehatan/program-kesehatan/${item.id}`)}
                    >
                      <IconDeviceImacCog size={18} />
                      <Text ml={5} fz="sm" fw={500} lh={1.4}>Detail</Text>
                    </Button>
                  </Stack>
                </Paper>
              ))
            ) : (
              <Center py={20}>
                <Text c="dimmed" fz="sm" lh={1.4}>
                  Tidak ada program kesehatan yang cocok
                </Text>
              </Center>
            )}
          </Stack>
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
  );
}

export default ProgramKesehatan;