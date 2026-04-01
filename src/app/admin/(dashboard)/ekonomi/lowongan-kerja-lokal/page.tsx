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
import HeaderSearch from '../../_com/header';
import lowonganKerjaState from '../../_state/ekonomi/lowongan-kerja';

function LowonganKerjaLokal() {
  const [search, setSearch] = useState("");

  return (
    <Box>
      <HeaderSearch
        title="Lowongan Kerja Lokal"
        placeholder="Cari pekerjaan atau perusahaan..."
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListLowonganKerjaLokal search={search} />
    </Box>
  );
}

function ListLowonganKerjaLokal({ search }: { search: string }) {
  const stateLowongan = useProxy(lowonganKerjaState);
  const router = useRouter();
  const [debouncedSearch] = useDebouncedValue(search, 1000);

  const { data, page, totalPages, loading, load } = stateLowongan.findMany;

  useShallowEffect(() => {
    load(page, 10, debouncedSearch);
  }, [page, debouncedSearch]);

  const filteredData = data || [];

  if (loading || !data) {
    return (
      <Stack py="md">
        <Skeleton height={600} radius="md" />
      </Stack>
    );
  }

  return (
    <Box py="md">
      <Paper withBorder bg={colors['white-1']} p="lg" shadow="md" radius="md">
        <Group justify="space-between" mb="lg">
          <Title order={4}>Daftar Lowongan Kerja Lokal</Title>
          <Button
            leftSection={<IconPlus size={18} />}
            color="blue"
            variant="light"
            onClick={() =>
              router.push('/admin/ekonomi/lowongan-kerja-lokal/create')
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
                <TableTh style={{ width: '25%' }}>
                  <Text fz="sm" fw={600} lh={1.2} c="black">Pekerjaan</Text>
                </TableTh>
                <TableTh style={{ width: '25%' }}>
                  <Text fz="sm" fw={600} lh={1.2} c="black">Nama Perusahaan</Text>
                </TableTh>
                <TableTh style={{ width: '20%' }}>
                  <Text fz="sm" fw={600} lh={1.2} c="black">Lokasi</Text>
                </TableTh>
                <TableTh style={{ width: '15%' }}>
                  <Text fz="sm" fw={600} lh={1.2} c="black">Aksi</Text>
                </TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>
                      <Text fz="md" fw={500} lh={1.5} truncate="end" lineClamp={1}>
                        {item.posisi}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Text fz="sm" fw={500} lh={1.5} truncate="end">
                        {item.namaPerusahaan}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Text fz="sm" fw={500} lh={1.5} truncate="end">
                        {item.lokasi}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Button
                        variant="light"
                        color="blue"
                        onClick={() =>
                          router.push(
                            `/admin/ekonomi/lowongan-kerja-lokal/${item.id}`
                          )
                        }
                        fullWidth
                        radius="sm"
                      >
                        <IconDeviceImac size={20} />
                        <Text ml="xs">Detail</Text>
                      </Button>
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={4}>
                    <Center py="xl">
                      <Text fz="sm" c="dimmed" lh={1.4}>
                        Tidak ada data lowongan kerja yang cocok
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
              <Paper key={item.id} withBorder p="md" radius="md">
                <Stack gap={"xs"}>
                  <Box>
                    <Text fz="sm" fw={600} lh={1.4}>Pekerjaan</Text>
                    <Text fz="sm" fw={500} lh={1.5}>
                      {item.posisi}
                    </Text>
                  </Box>
                  <Box>
                    <Text fz="sm" fw={600} lh={1.4}>Nama Perusahaan</Text>
                    <Text fz="sm" fw={500} lh={1.5}>
                      {item.namaPerusahaan}
                    </Text>
                  </Box>
                  <Box>
                    <Text fz="sm" fw={600} lh={1.4}>Lokasi</Text>
                    <Text fz="sm" fw={500} lh={1.5}>
                      {item.lokasi}
                    </Text>
                  </Box>
                  <Button
                    variant="light"
                    color="blue"
                    onClick={() =>
                      router.push(
                        `/admin/ekonomi/lowongan-kerja-lokal/${item.id}`
                      )
                    }
                    fullWidth
                    radius="sm"
                    mt="xs"
                  >
                    <IconDeviceImac size={20} />
                    <Text ml="xs">Detail</Text>
                  </Button>
                </Stack>
              </Paper>
            ))
          ) : (
            <Center py="xl">
              <Text fz="sm" c="dimmed" lh={1.4}>
                Tidak ada data lowongan kerja yang cocok
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

export default LowonganKerjaLokal;