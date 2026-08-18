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
import { IconDeviceImacCog, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import pendaftaranJadwalKegiatanState from '../../../_state/kesehatan/data_kesehatan_warga/pendafataranJadwalKegiatan';

function PesertaJadwalKegiatan() {
  const [search, setSearch] = useState("");

  return (
    <Box>
      <HeaderSearch
        title="Daftar Peserta Kegiatan"
        placeholder="Cari nama peserta..."
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />

      <ListPesertaJadwalKegiatan search={search} />
    </Box>
  );
}

function ListPesertaJadwalKegiatan({ search }: { search: string }) {
  const state = useProxy(pendaftaranJadwalKegiatanState);
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
        <Group justify="space-between" mb="md">
          <Title order={4}>Daftar Peserta Kegiatan</Title>
        </Group>

        {/* Desktop Table */}
        <Box visibleFrom="md" style={{ overflowX: 'auto' }}>
          <Table highlightOnHover layout="fixed" withColumnBorders={false}>
            <TableThead>
              <TableTr>
                <TableTh fz="sm" fw={600} lh={1.2}>Nama</TableTh>
                <TableTh fz="sm" fw={600} lh={1.2}>Tanggal Lahir</TableTh>
                <TableTh fz="sm" fw={600} lh={1.2}>Nama Orang Tua/Wali</TableTh>
                <TableTh fz="sm" fw={600} lh={1.2}>Nomor Telepon</TableTh>
                <TableTh fz="sm" fw={600} lh={1.2}>Alamat</TableTh>
                <TableTh fz="sm" fw={600} lh={1.2}>Aksi</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>
                      <Text fz="md" fw={500} lh={1.5} truncate="end" lineClamp={1}>
                        {item.name}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Text fz="md" lh={1.5}>
                        {item.tanggal}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Text fz="md" lh={1.5} truncate="end">
                        {item.namaOrangtua}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Text fz="md" lh={1.5}>
                        {item.nomor}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Text fz="md" lh={1.5} c="dimmed" truncate="end">
                        {item.alamat}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Button
                        variant="light"
                        color="blue"
                        onClick={() =>
                          router.push(
                            `/admin/kesehatan/data-kesehatan-warga/peserta_jadwal_kegiatan/${item.id}`
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
                  <TableTd colSpan={6}>
                    <Center py="xl">
                      <Text c="dimmed" fz="sm" lh={1.4}>
                        Tidak ada peserta kegiatan yang cocok
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
                    <Text fz="sm" fw={500} lh={1.5}>{item.name}</Text>
                  </Box>
                  <Box>
                    <Text fz="sm" fw={600} lh={1.4}>Tanggal Lahir</Text>
                    <Text fz="sm" fw={500} lh={1.5}>{item.tanggal}</Text>
                  </Box>
                  <Box>
                    <Text fz="sm" fw={600} lh={1.4}>Nama Orang Tua/Wali</Text>
                    <Text fz="sm" fw={500} lh={1.5}>{item.namaOrangtua}</Text>
                  </Box>
                  <Box>
                    <Text fz="sm" fw={600} lh={1.4}>Nomor Telepon</Text>
                    <Text fz="sm" fw={500} lh={1.5}>{item.nomor}</Text>
                  </Box>
                  <Box>
                    <Text fz="sm" fw={600} lh={1.4}>Alamat</Text>
                    <Text fz="sm" fw={500} lh={1.5} c="dimmed">{item.alamat}</Text>
                  </Box>
                  <Box>
                    <Button
                      fullWidth
                      variant="light"
                      color="blue"
                      onClick={() =>
                        router.push(
                          `/admin/kesehatan/data-kesehatan-warga/peserta_jadwal_kegiatan/${item.id}`
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
                Tidak ada peserta kegiatan yang cocok
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

export default PesertaJadwalKegiatan;
