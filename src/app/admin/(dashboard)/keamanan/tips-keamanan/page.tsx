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
import { IconDeviceImac, IconPlus, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../_com/header';
import tipsKeamananState from '../../_state/keamanan/tips-keamanan';

function TipsKeamanan() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      <HeaderSearch
        title='Tips Keamanan'
        placeholder='Cari tips keamanan...'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListTipsKeamanan search={search} />
    </Box>
  );
}

function ListTipsKeamanan({ search }: { search: string }) {
  const stateKeamanan = useProxy(tipsKeamananState);
  const router = useRouter();
  const [debouncedSearch] = useDebouncedValue(search, 1000);

  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = stateKeamanan.findMany;

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
      <Paper withBorder bg={colors['white-1']} p="lg" shadow="md" radius="md">
        <Group justify="space-between" mb="md">
          <Title order={4}>Daftar Tips Keamanan</Title>
          <Button
            leftSection={<IconPlus size={18} />}
            color="blue"
            variant="light"
            onClick={() => router.push('/admin/keamanan/tips-keamanan/create')}
          >
            Tambah Baru
          </Button>
        </Group>

        {/* Desktop Table */}
        <Box visibleFrom="md">
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
                <TableTh style={{ width: '25%' }}>
                  <Text fz="sm" fw={600} lh={1.2}>
                    Judul
                  </Text>
                </TableTh>
                <TableTh style={{ width: '45%' }}>
                  <Text fz="sm" fw={600} lh={1.2}>
                    Deskripsi
                  </Text>
                </TableTh>
                <TableTh style={{ width: '30%' }}>
                  <Text fz="sm" fw={600} lh={1.2}>
                    Aksi
                  </Text>
                </TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>
                      <Text fz="md" fw={500} lh={1.5} truncate="end" lineClamp={1}>
                        {item.judul}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Text
                        fz="sm"
                        c="dimmed"
                        lh={1.5}
                        lineClamp={1}
                        dangerouslySetInnerHTML={{ __html: item.deskripsi }}
                      />
                    </TableTd>
                    <TableTd>
                      <Button
                        variant="light"
                        color="blue"
                        onClick={() =>
                          router.push(`/admin/keamanan/tips-keamanan/${item.id}`)
                        }
                      >
                        <IconDeviceImac size={20} />
                        <Text ml="xs">Detail</Text>
                      </Button>
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={3}>
                    <Center py="xl">
                      <Text c="dimmed" fz="sm" lh={1.4}>
                        Tidak ada data tips keamanan yang cocok
                      </Text>
                    </Center>
                  </TableTd>
                </TableTr>
              )}
            </TableTbody>
          </Table>
        </Box>

        {/* Mobile Cards */}
        <Stack gap="sm" hiddenFrom="md">
          {filteredData.length > 0 ? (
            filteredData.map((item) => (
              <Paper key={item.id} withBorder p="md" radius="md">
                <Stack gap={'xs'}>
                  <Box>
                    <Text fz="sm" fw={600} lh={1.4}>
                      Judul
                    </Text>
                    <Text fz="sm" fw={500} lh={1.45}>
                      {item.judul}
                    </Text>
                  </Box>
                  <Box>
                    <Text fz="sm" fw={600} lh={1.4}>
                      Deskripsi
                    </Text>
                    <Box pl={8}>
                      <Text
                      fz="sm"
                      fw={500}
                      lh={1.45}
                      dangerouslySetInnerHTML={{ __html: item.deskripsi }}
                    />
                    </Box>
                  </Box>
                  <Box>
                    <Button
                      variant="light"
                      color="blue"
                      fullWidth
                      onClick={() =>
                        router.push(`/admin/keamanan/tips-keamanan/${item.id}`)
                      }
                    >
                      <IconDeviceImac size={20} />
                      <Text ml="xs">Detail</Text>
                    </Button>
                  </Box>
                </Stack>
              </Paper>
            ))
          ) : (
            <Center py="xl">
              <Text c="dimmed" fz="sm" lh={1.4}>
                Tidak ada data tips keamanan yang cocok
              </Text>
            </Center>
          )}
        </Stack>
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

export default TipsKeamanan;