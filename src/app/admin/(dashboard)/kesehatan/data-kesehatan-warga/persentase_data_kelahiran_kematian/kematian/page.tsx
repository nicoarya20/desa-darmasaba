'use client'
import HeaderSearch from '@/app/admin/(dashboard)/_com/header';
import persentasekelahiran from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/persentaseKelahiran';
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
import { IconArrowBack, IconDeviceImacCog, IconPlus, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';

function Kematian() {
  const [search, setSearch] = useState("");
  const router = useRouter();

  return (
    <Box>
      {/* Tombol Back */}
      <Box mb="md">
        <Button variant="subtle" onClick={() => router.push('/admin/kesehatan/data-kesehatan-warga/persentase_data_kelahiran_kematian')}>
          <IconArrowBack color={colors["blue-button"]} size={30} />
        </Button>
      </Box>

      {/* Header dengan Search */}
      <HeaderSearch
        title='Data Kematian'
        placeholder='Cari nama atau alamat...'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />

      <ListKematian search={search} />
    </Box>
  );
}

function ListKematian({ search }: { search: string }) {
  const statePersentase = useProxy(persentasekelahiran.kematian);
  const router = useRouter();
  const [debouncedSearch] = useDebouncedValue(search, 1000);

  const { data, page, totalPages, loading, load } = statePersentase.findMany;

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
        <Group justify="space-between" mb="md">
          <Title order={2} visibleFrom="md">Daftar Data Kematian</Title>
          <Title order={3} hiddenFrom="md">Daftar Data Kematian</Title>
          <Button
            leftSection={<IconPlus size={18} />}
            color="blue"
            variant="light"
            onClick={() =>
              router.push(
                '/admin/kesehatan/data-kesehatan-warga/persentase_data_kelahiran_kematian/kematian/create'
              )
            }
          >
            Tambah Baru
          </Button>
        </Group>

        {/* Tabel untuk desktop */}
        <Box visibleFrom="md">
          <Table highlightOnHover>
            <TableThead>
              <TableTr>
                <TableTh><Text fz="sm" fw={600} lh={1.2}>Nama</Text></TableTh>
                <TableTh><Text fz="sm" fw={600} lh={1.2}>Tanggal</Text></TableTh>
                <TableTh><Text fz="sm" fw={600} lh={1.2}>Jenis Kelamin</Text></TableTh>
                <TableTh><Text fz="sm" fw={600} lh={1.2}>Alamat</Text></TableTh>
                <TableTh><Text fz="sm" fw={600} lh={1.2}>Aksi</Text></TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>
                      <Text fz="md" fw={500} lh={1.5} truncate="end">
                        {item.nama}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Text fz="md" fw={500} lh={1.5}>
                        {new Date(item.tanggal).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Text fz="md" fw={500} lh={1.5}>{item.jenisKelamin}</Text>
                    </TableTd>
                    <TableTd>
                      <Text fz="md" fw={500} lh={1.5} c="dimmed" truncate="end">
                        {item.alamat}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Button
                        variant="light"
                        color="blue"
                        leftSection={<IconDeviceImacCog size={16} />}
                        onClick={() =>
                          router.push(
                            `/admin/kesehatan/data-kesehatan-warga/persentase_data_kelahiran_kematian/kematian/${item.id}`
                          )
                        }
                      >
                        Detail
                      </Button>
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={5}>
                    <Center py="xl">
                      <Text c="dimmed" fz="sm" lh={1.4}>
                        Tidak ada data kematian yang cocok
                      </Text>
                    </Center>
                  </TableTd>
                </TableTr>
              )}
            </TableTbody>
          </Table>
        </Box>

        {/* Card untuk mobile */}
        <Stack gap="sm" hiddenFrom="md">
          {filteredData.length > 0 ? (
            filteredData.map((item) => (
              <Paper key={item.id} withBorder p="md" radius="md">
                <Stack gap="xs">
                  <Box>
                    <Text fz="sm" fw={600} lh={1.4}>Nama</Text>
                    <Text fz="sm" fw={500} lh={1.45}>{item.nama}</Text>
                  </Box>
                  <Box>
                    <Text fz="sm" fw={600} lh={1.4}>Tanggal</Text>
                    <Text fz="sm" fw={500} lh={1.45}>
                      {new Date(item.tanggal).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </Text>
                  </Box>
                  <Box>
                    <Text fz="sm" fw={600} lh={1.4}>Jenis Kelamin</Text>
                    <Text fz="sm" fw={500} lh={1.45}>{item.jenisKelamin}</Text>
                  </Box>
                  <Box>
                    <Text fz="sm" fw={600} lh={1.4}>Alamat</Text>
                    <Text fz="sm" fw={500} lh={1.45} c="dimmed">{item.alamat}</Text>
                  </Box>
                  <Box mt="xs">
                    <Button
                      fullWidth
                      variant="light"
                      color="blue"
                      leftSection={<IconDeviceImacCog size={16} />}
                      onClick={() =>
                        router.push(
                          `/admin/kesehatan/data-kesehatan-warga/persentase_data_kelahiran_kematian/kematian/${item.id}`
                        )
                      }
                    >
                      Detail
                    </Button>
                  </Box>
                </Stack>
              </Paper>
            ))
          ) : (
            <Center py="xl">
              <Text c="dimmed" fz="sm" lh={1.4}>
                Tidak ada data kematian yang cocok
              </Text>
            </Center>
          )}
        </Stack>
      </Paper>

      {/* Pagination */}
      {totalPages > 1 && (
        <Center mt="lg">
          <Pagination
            value={page}
            onChange={(newPage) => {
              load(newPage, 10, search);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            total={totalPages}
            color="blue"
            radius="md"
          />
        </Center>
      )}
    </Box>
  );
}

export default Kematian;