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
import penangananDarurat from '../../_state/kesehatan/penanganan-darurat/penangananDarurat';

function PenangananDarurat() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      {/* Header Search */}
      <HeaderSearch
        title='Penanganan Darurat'
        placeholder='Cari judul atau deskripsi...'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />

      <ListPenangananDarurat search={search} />
    </Box>
  );
}

function ListPenangananDarurat({ search }: { search: string }) {
  const state = useProxy(penangananDarurat);
  const router = useRouter();
  const [debouncedSearch] = useDebouncedValue(search, 1000)

  const { data, page, totalPages, loading, load } = state.findMany;

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
      <Paper withBorder bg={colors['white-1']} p={{ base: 'md', md: 'lg' }} shadow="md" radius="md">
        {/* Judul + Tombol Tambah */}
        <Group justify="space-between" mb={{ base: 'sm', md: 'md' }}>
          <Title
            order={4}
            lh={1.2}
          >
            Daftar Penanganan Darurat
          </Title>
          <Button
            leftSection={<IconPlus size={18} />}
            color="blue"
            variant="light"
            onClick={() => router.push('/admin/kesehatan/penanganan-darurat/create')}
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
                <TableTh fz="sm" fw={600} lh={1.4}>Judul</TableTh>
                <TableTh fz="sm" fw={600} lh={1.4}>Deskripsi</TableTh>
                <TableTh fz="sm" fw={600} lh={1.4}>Aksi</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>
                      <Text fz="md" fw={500} lh={1.5} lineClamp={1}>
                        {item.name}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Text
                        fz="sm"
                        fw={400}
                        lh={1.5}
                        c="gray.7"
                        lineClamp={1}
                        dangerouslySetInnerHTML={{ __html: item.deskripsi }}
                      />
                    </TableTd>
                    <TableTd>
                      <Button
                        variant="light"
                        color="blue"
                        onClick={() =>
                          router.push(`/admin/kesehatan/penanganan-darurat/${item.id}`)
                        }
                      >
                        <IconDeviceImacCog size={20} />
                        <Text ml={5} fz="sm" fw={500}>Detail</Text>
                      </Button>
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={3}>
                    <Center py={20}>
                      <Text c="gray.6" fz="sm" fw={500} lh={1.4}>
                        Tidak ada data penanganan darurat
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
          <Stack gap="md">
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <Paper key={item.id} withBorder p="md" radius="sm">
                  <Stack gap={'xs'}>
                    <Box>
                      <Text fz="sm" fw={600} lh={1.4}>Judul</Text>
                      <Text fz="sm" fw={500} lh={1.45} lineClamp={1}>
                        {item.name}
                      </Text>
                    </Box>
                    <Box>
                      <Text fz="sm" fw={600} lh={1.4}>Deskripsi</Text>
                      <Text
                        fz="sm"
                        fw={500}
                        lh={1.45}
                        c="gray.7"
                        lineClamp={2}
                        dangerouslySetInnerHTML={{ __html: item.deskripsi }}
                      />
                    </Box>
                    <Box>
                      <Button
                        variant="light"
                        color="blue"
                        fullWidth
                        onClick={() =>
                          router.push(`/admin/kesehatan/penanganan-darurat/${item.id}`)
                        }
                      >
                        <IconDeviceImacCog size={20} />
                        <Text ml={5} fz="sm" fw={500}>Detail</Text>
                      </Button>
                    </Box>
                  </Stack>
                </Paper>
              ))
            ) : (
              <Center py={20}>
                <Text c="gray.6" fz="sm" fw={500} lh={1.4}>
                  Tidak ada data penanganan darurat
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

export default PenangananDarurat;