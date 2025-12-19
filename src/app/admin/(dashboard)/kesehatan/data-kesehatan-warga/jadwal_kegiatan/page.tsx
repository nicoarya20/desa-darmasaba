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
import jadwalKegiatanState from '../../../_state/kesehatan/data_kesehatan_warga/jadwalKegiatan';

function JadwalKegiatan() {
  const [search, setSearch] = useState("");

  return (
    <Box>
      {/* Header Search */}
      <HeaderSearch
        title="Jadwal Kegiatan"
        placeholder="Cari nama, tanggal, lokasi..."
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />

      <ListJadwalKegiatan search={search} />
    </Box>
  );
}

function ListJadwalKegiatan({ search }: { search: string }) {
  const state = useProxy(jadwalKegiatanState);
  const router = useRouter();

  const { data, page, totalPages, loading, load } = state.findMany;
  const [debouncedSearch] = useDebouncedValue(search, 1000);

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
        {/* Judul + Tombol Tambah */}
        <Group justify="space-between" mb="md">
          <Title order={4}>Daftar Jadwal Kegiatan</Title>
          <Button
            leftSection={<IconPlus size={18} />}
            color="blue"
            variant="light"
            onClick={() =>
              router.push('/admin/kesehatan/data-kesehatan-warga/jadwal_kegiatan/create')
            }
          >
            Tambah Baru
          </Button>
        </Group>

        {/* Desktop Table */}
        <Box visibleFrom="md">
          <Table highlightOnHover>
            <TableThead>
              <TableTr>
                <TableTh fz="sm" fw={600} lh={1.2}>Nama</TableTh>
                <TableTh fz="sm" fw={600} lh={1.2}>Tanggal</TableTh>
                <TableTh fz="sm" fw={600} lh={1.2}>Waktu</TableTh>
                <TableTh fz="sm" fw={600} lh={1.2}>Lokasi</TableTh>
                <TableTh fz="sm" fw={600} lh={1.2}>Aksi</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>
                      <Text fz="md" fw={500} lh={1.5} truncate="end" lineClamp={1}>
                        {item.informasijadwalkegiatan.name}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Text fz="md" lh={1.5}>
                        {new Date(item.informasijadwalkegiatan.tanggal).toLocaleDateString(
                          'id-ID',
                          {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                          }
                        )}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Text fz="md" lh={1.5}>
                        {item.informasijadwalkegiatan.waktu}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Text fz="md" lh={1.5} c="dimmed" truncate="end">
                        {item.informasijadwalkegiatan.lokasi}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Button
                        variant="light"
                        color="blue"
                        onClick={() =>
                          router.push(
                            `/admin/kesehatan/data-kesehatan-warga/jadwal_kegiatan/${item.id}`
                          )
                        }
                      >
                        <IconDeviceImacCog size={20} />
                        <Text ml={5} fz="sm" fw={500} lh={1.5}>
                          Detail
                        </Text>
                      </Button>
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={5}>
                    <Center py="xl">
                      <Text c="dimmed" fz="sm" lh={1.4}>
                        Tidak ada jadwal kegiatan yang cocok
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
                <Stack gap={"xs"}>
                  <Box>
                    <Text fz="sm" fw={600} lh={1.4}>Nama</Text>
                    <Text fz="sm" fw={500} lh={1.5}>
                      {item.informasijadwalkegiatan.name}
                    </Text>
                  </Box>
                  <Box>
                    <Text fz="sm" fw={600} lh={1.4}>Tanggal</Text>
                    <Text fz="sm" fw={500} lh={1.5}>
                      {new Date(item.informasijadwalkegiatan.tanggal).toLocaleDateString(
                        'id-ID',
                        {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        }
                      )}
                    </Text>
                  </Box>
                  <Box>
                    <Text fz="sm" fw={600} lh={1.4}>Waktu</Text>
                    <Text fz="sm" fw={500} lh={1.5}>
                      {item.informasijadwalkegiatan.waktu}
                    </Text>
                  </Box>
                  <Box>
                    <Text fz="sm" fw={600} lh={1.4}>Lokasi</Text>
                    <Text fz="sm" fw={500} lh={1.5} c="dimmed">
                      {item.informasijadwalkegiatan.lokasi}
                    </Text>
                  </Box>
                  <Box>
                    <Button
                      fullWidth
                      variant="light"
                      color="blue"
                      onClick={() =>
                        router.push(
                          `/admin/kesehatan/data-kesehatan-warga/jadwal_kegiatan/${item.id}`
                        )
                      }
                    >
                      <IconDeviceImacCog size={20} />
                      <Text ml={5} fz="sm" fw={500} lh={1.5}>
                        Detail
                      </Text>
                    </Button>
                  </Box>
                </Stack>
              </Paper>
            ))
          ) : (
            <Center py="xl">
              <Text c="dimmed" fz="sm" lh={1.4}>
                Tidak ada jadwal kegiatan yang cocok
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

export default JadwalKegiatan;