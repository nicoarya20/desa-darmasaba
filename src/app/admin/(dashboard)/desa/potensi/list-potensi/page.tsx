/* eslint-disable react-hooks/exhaustive-deps */
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
import { IconDeviceImacCog, IconPlus, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import potensiDesaState from '../../../_state/desa/potensi';
import { useDebouncedValue } from '@mantine/hooks';

function Potensi() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      <HeaderSearch
        title='Potensi Desa'
        placeholder='Cari potensi atau kategori...'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListPotensi search={search} />
    </Box>
  );
}

function ListPotensi({ search }: { search: string }) {
  const potensiState = useProxy(potensiDesaState);
  const router = useRouter();
  const [debouncedSearch] = useDebouncedValue(search, 1000);

  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = potensiState.potensiDesa.findMany;

  useEffect(() => {
    potensiState.kategoriPotensi.findMany.load();
    load(page, 10, debouncedSearch);
  }, [page, debouncedSearch]);

  const filteredData = data || [];

  if (loading || !data) {
    return (
      <Stack py="lg">
        <Skeleton height={600} radius="md" />
      </Stack>
    );
  }

  return (
    <Box py="lg">
      <Paper withBorder bg={colors['white-1']} p={{ base: 'md', md: 'lg' }} shadow="md" radius="md">
        <Group justify="space-between" mb={{ base: 'sm', md: 'md' }}>
          <Title order={2} lh={1.2}>
            Daftar Potensi Desa
          </Title>
          <Button
            leftSection={<IconPlus size={18} />}
            color="blue"
            variant="light"
            onClick={() => router.push('/admin/desa/potensi/list-potensi/create')}
          >
            Tambah Baru
          </Button>
        </Group>

        {/* Desktop Table */}
        <Box visibleFrom="md">
          <Table highlightOnHover miw={700}>
            <TableThead>
              <TableTr>
                <TableTh w="20%">
                  <Text fz="sm" fw={600} lh={1.4}>
                    Judul
                  </Text>
                </TableTh>
                <TableTh w="20%">
                  <Text fz="sm" fw={600} lh={1.4}>
                    Kategori
                  </Text>
                </TableTh>
                <TableTh w="35%">
                  <Text fz="sm" fw={600} lh={1.4}>
                    Deskripsi
                  </Text>
                </TableTh>
                <TableTh w="15%">
                  <Text fz="sm" fw={600} lh={1.4}>
                    Detail
                  </Text>
                </TableTh>
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
                      <Text fz="sm" c="gray.7" lh={1.5}>
                        {item.kategori?.nama || '-'}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Text
                        fz="sm"
                        lh={1.5}
                        lineClamp={2}
                        dangerouslySetInnerHTML={{ __html: item.deskripsi }}
                        style={{ wordBreak: 'break-word' }}
                      />
                    </TableTd>
                    <TableTd>
                      <Button
                        size="xs"
                        radius="md"
                        variant="light"
                        color="blue"
                        leftSection={<IconDeviceImacCog size={16} />}
                        onClick={() => router.push(`/admin/desa/potensi/list-potensi/${item.id}`)}
                      >
                        Detail
                      </Button>
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={4}>
                    <Center py="xl">
                      <Text c="gray.6" fz="sm" ta="center" lh={1.5}>
                        Tidak ada data potensi yang cocok
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
            <Stack gap="sm">
              {filteredData.map((item) => (
                <Paper key={item.id} withBorder p="sm" radius="md">
                  <Box mb="xs">
                    <Text fz="xs" fw={600} lh={1.4}>
                      Judul
                    </Text>
                    <Text fz="sm" fw={500} lh={1.5}>
                      {item.name}
                    </Text>
                  </Box>
                  <Box mb="xs">
                    <Text fz="xs" fw={600} lh={1.4}>
                      Kategori
                    </Text>
                    <Text fz="sm" c="gray.7" lh={1.5}>
                      {item.kategori?.nama || '-'}
                    </Text>
                  </Box>
                  <Box mb="xs">
                    <Text fz="xs" fw={600} lh={1.4}>
                      Deskripsi
                    </Text>
                    <Text
                      fz="sm"
                      lh={1.5}
                      dangerouslySetInnerHTML={{ __html: item.deskripsi }}
                      style={{ wordBreak: 'break-word' }}
                    />
                  </Box>
                  <Button
                    size="xs"
                    radius="md"
                    variant="light"
                    color="blue"
                    leftSection={<IconDeviceImacCog size={16} />}
                    onClick={() => router.push(`/admin/desa/potensi/list-potensi/${item.id}`)}
                    w="100%"
                  >
                    Detail
                  </Button>
                </Paper>
              ))}
            </Stack>
          ) : (
            <Center py="xl">
              <Text c="gray.6" fz="sm" ta="center" lh={1.5}>
                Tidak ada data potensi yang cocok
              </Text>
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

export default Potensi;