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
import infoWabahPenyakit from '../../_state/kesehatan/info-wabah-penyakit/infoWabahPenyakit';

function InfoWabahPenyakit() {
  const [search, setSearch] = useState('');
  return (
    <Box>
      {/* Header Search */}
      <HeaderSearch
        title='Info Wabah Penyakit'
        placeholder='Cari judul atau deskripsi...'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListInfoWabahPenyakit search={search} />
    </Box>
  );
}

function ListInfoWabahPenyakit({ search }: { search: string }) {
  const infoWabahPenyakitState = useProxy(infoWabahPenyakit);
  const router = useRouter();
  const [debouncedSearch] = useDebouncedValue(search, 1000);

  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = infoWabahPenyakitState.findMany;

  useShallowEffect(() => {
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
        {/* Judul + Tombol Tambah */}
        <Group justify="space-between" mb={{ base: 'sm', md: 'md' }}>
          <Title
            order={4}
            lh={{ base: 1.2, md: 1.1 }}
          >
            Daftar Info Wabah Penyakit
          </Title>
          <Button
            leftSection={<IconPlus size={18} />}
            color="blue"
            variant="light"
            onClick={() => router.push('/admin/kesehatan/info-wabah-penyakit/create')}
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
                <TableTh>Judul</TableTh>
                <TableTh>Deskripsi Singkat</TableTh>
                <TableTh>Aksi</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>
                      <Text fz="md" fw={500} lh={1.45} truncate="end" lineClamp={1}>
                        {item.name}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Text
                        fz="sm"
                        c="dimmed"
                        lh={1.45}
                        truncate="end"
                        lineClamp={1}
                        dangerouslySetInnerHTML={{ __html: item.deskripsiSingkat }}
                      />
                    </TableTd>
                    <TableTd>
                      <Button
                        variant="light"
                        color="blue"
                        onClick={() => router.push(`/admin/kesehatan/info-wabah-penyakit/${item.id}`)}
                      >
                        <IconDeviceImacCog size={20} />
                        <Text ml={5} fz="sm" fw={500} lh={1.45}>
                          Detail
                        </Text>
                      </Button>
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={3}>
                    <Center py="xl">
                      <Text c="dimmed" fz="sm" lh={1.4}>
                        Tidak ada data info wabah penyakit yang cocok
                      </Text>
                    </Center>
                  </TableTd>
                </TableTr>
              )}
            </TableTbody>
          </Table>
        </Box>

        {/* Mobile Card List */}
        <Stack gap="sm" hiddenFrom="md">
          {filteredData.length > 0 ? (
            filteredData.map((item) => (
              <Paper key={item.id} withBorder p="md" radius="sm">
                <Stack gap={"xs"}>
                  <Text fz="sm" fw={600} lh={1.4}>
                    Judul
                  </Text>
                  <Text fz="sm" fw={500} lh={1.45}>
                    {item.name}
                  </Text>

                  <Text fz="sm" fw={600} lh={1.4}>
                    Deskripsi Singkat
                  </Text>
                  <Text
                    fz="sm"
                    fw={500}
                    lh={1.45}
                    dangerouslySetInnerHTML={{ __html: item.deskripsiSingkat }}
                  />

                  <Button
                    variant="light"
                    color="blue"
                    fullWidth
                    mt="xs"
                    onClick={() => router.push(`/admin/kesehatan/info-wabah-penyakit/${item.id}`)}
                  >
                    <IconDeviceImacCog size={20} />
                    <Text ml={6} fz="sm" fw={500} lh={1.45}>
                      Detail
                    </Text>
                  </Button>
                </Stack>
              </Paper>
            ))
          ) : (
            <Center py="xl">
              <Text c="dimmed" fz="sm" lh={1.4}>
                Tidak ada data info wabah penyakit yang cocok
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
    </Box>
  );
}

export default InfoWabahPenyakit;