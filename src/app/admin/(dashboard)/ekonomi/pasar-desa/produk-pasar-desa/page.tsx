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
import pasarDesaState from '../../../_state/ekonomi/pasar-desa/pasar-desa';

function PasarDesa() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      <HeaderSearch
        title="Produk Pasar Desa"
        placeholder="Cari produk pasar desa..."
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListPasarDesa search={search} />
    </Box>
  );
}

function ListPasarDesa({ search }: { search: string }) {
  const statePasar = useProxy(pasarDesaState.pasarDesa);
  const router = useRouter();
  const [debouncedSearch] = useDebouncedValue(search, 1000);

  const { data, page, totalPages, loading, load } = statePasar.findMany;

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
          <Title order={4} lh={1.2}>Daftar Produk Pasar Desa</Title>
          <Button
            leftSection={<IconPlus size={18} />}
            color="blue"
            variant="light"
            onClick={() =>
              router.push('/admin/ekonomi/pasar-desa/produk-pasar-desa/create')
            }
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
                <TableTh style={{ width: '25%' }}><Text fz="sm" fw={600} lh={1.4}>Nama Produk</Text></TableTh>
                <TableTh style={{ width: '20%' }}><Text fz="sm" fw={600} lh={1.4}>Harga Produk</Text></TableTh>
                <TableTh style={{ width: '15%' }}><Text fz="sm" fw={600} lh={1.4}>Rating</Text></TableTh>
                <TableTh style={{ width: '25%' }}><Text fz="sm" fw={600} lh={1.4}>Alamat Usaha</Text></TableTh>
                <TableTh style={{ width: '15%' }}><Text fz="sm" fw={600} lh={1.4}>Aksi</Text></TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>
                      <Text fz="md" fw={500} lh={1.5} truncate="end" lineClamp={1}>
                        {item.nama}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Text fz="md" lh={1.5}>Rp.{item.harga}</Text>
                    </TableTd>
                    <TableTd>
                      <Text fz="md" lh={1.5}>{item.rating || '-'}</Text>
                    </TableTd>
                    <TableTd>
                      <Text fz="sm" lh={1.5} c="dimmed">
                        {item.alamatUsaha || '-'}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Button
                        variant="light"
                        color="blue"
                        onClick={() =>
                          router.push(
                            `/admin/ekonomi/pasar-desa/produk-pasar-desa/${item.id}`
                          )
                        }
                      >
                        <IconDeviceImac size={20} />
                        <Text ml={5} fz="sm" fw={500} lh={1.4}>Detail</Text>
                      </Button>
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={5}>
                    <Center py={32}>
                      <Text c="dimmed" fz="sm" lh={1.5}>
                        Tidak ada produk pasar desa yang cocok
                      </Text>
                    </Center>
                  </TableTd>
                </TableTr>
              )}
            </TableTbody>
          </Table>
        </Box>

        {/* Mobile Cards */}
        <Stack hiddenFrom="md" gap="sm">
          {filteredData.length > 0 ? (
            filteredData.map((item) => (
              <Paper key={item.id} withBorder p="md" radius="md">
                <Stack gap={'xs'}>
                  <Box>
                    <Text fz="sm" fw={600} lh={1.4}>Nama Produk</Text>
                    <Text fz="sm" fw={500} lh={1.4}>{item.nama}</Text>
                  </Box>
                  <Box>
                    <Text fz="sm" fw={600} lh={1.4}>Harga Produk</Text>
                    <Text fz="sm" fw={500} lh={1.4}>Rp.{item.harga}</Text>
                  </Box>
                  <Box>
                    <Text fz="sm" fw={600} lh={1.4}>Rating</Text>
                    <Text fz="sm" fw={500} lh={1.4}>{item.rating || '-'}</Text>
                  </Box>
                  <Box>
                    <Text fz="sm" fw={600} lh={1.4}>Alamat Usaha</Text>
                    <Text fz="sm" fw={500} lh={1.4} c="dimmed">
                      {item.alamatUsaha || '-'}
                    </Text>
                  </Box>
                  <Box>
                    <Button
                      fullWidth
                      variant="light"
                      color="blue"
                      onClick={() =>
                        router.push(
                          `/admin/ekonomi/pasar-desa/produk-pasar-desa/${item.id}`
                        )
                      }
                    >
                      <IconDeviceImac size={20} />
                      <Text ml={5} fz="sm" fw={500} lh={1.4}>Detail</Text>
                    </Button>
                  </Box>
                </Stack>
              </Paper>
            ))
          ) : (
            <Center py={32}>
              <Text c="dimmed" fz="sm" lh={1.5}>
                Tidak ada produk pasar desa yang cocok
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

export default PasarDesa;