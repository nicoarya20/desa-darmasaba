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


function Kelahiran() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  return (
    <Box>
      {/* Tombol Back */}
      <Box mb="sm">
        <Button variant="subtle" onClick={() => router.push('/admin/kesehatan/data-kesehatan-warga/persentase_data_kelahiran_kematian')}>
          <IconArrowBack color={colors["blue-button"]} size={25} />
        </Button>
      </Box>

      {/* Header Search */}
      <HeaderSearch
        title='Data Kelahiran'
        placeholder='Cari nama atau alamat...'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />

      <ListKelahiran search={search} />
    </Box>
  );
}


function ListKelahiran({ search }: { search: string }) {
  const statePersentase = useProxy(persentasekelahiran.kelahiran);
  const router = useRouter();
  const [debouncedSearch] = useDebouncedValue(search, 1000); // 500ms delay

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
    <Stack py="md" gap="xl">
      <Paper withBorder bg={colors['white-1']} p={{ base: 'md', md: 'lg' }} shadow="md" radius="md">
        {/* Judul + Tombol Tambah */}
        <Group justify="space-between" mb="lg">
          <Title order={2} lh={1.2}>
            Daftar Data Kelahiran
          </Title>
          <Button
            leftSection={<IconPlus size={18} />}
            color="blue"
            variant="light"
            onClick={() =>
              router.push(
                '/admin/kesehatan/data-kesehatan-warga/persentase_data_kelahiran_kematian/kelahiran/create'
              )
            }
          >
            Tambah Baru
          </Button>
        </Group>

        {/* Desktop Table */}
       <Box visibleFrom="md" style={{ overflowX: 'auto' }}>
         <Table highlightOnHover
    layout="fixed" // 🔥 PENTING
    withColumnBorders={false} fz="md">
            <TableThead>
              <TableTr>
                <TableTh><Text fz="sm" fw={600} lh={1.4}>Nama</Text></TableTh>
                <TableTh><Text fz="sm" fw={600} lh={1.4}>Tanggal</Text></TableTh>
                <TableTh><Text fz="sm" fw={600} lh={1.4}>Jenis Kelamin</Text></TableTh>
                <TableTh><Text fz="sm" fw={600} lh={1.4}>Alamat</Text></TableTh>
                <TableTh><Text fz="sm" fw={600} lh={1.4}>Aksi</Text></TableTh>
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
                      <Text fz="md" lh={1.5}>
                        {new Date(item.tanggal).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Text fz="md" lh={1.5}>
                        {item.jenisKelamin}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Text fz="md" lh={1.5} c="dimmed" truncate="end" lineClamp={1}>
                        {item.alamat}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Button
                        variant="light"
                        color="blue"
                        onClick={() =>
                          router.push(
                            `/admin/kesehatan/data-kesehatan-warga/persentase_data_kelahiran_kematian/kelahiran/${item.id}`
                          )
                        }
                        size="compact-sm"
                      >
                        <IconDeviceImacCog size={18} />
                        <Text ml="xs">Detail</Text>
                      </Button>
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={5}>
                    <Center py="lg">
                      <Text c="dimmed" fz="sm" lh={1.4}>
                        Tidak ada data kelahiran yang cocok
                      </Text>
                    </Center>
                  </TableTd>
                </TableTr>
              )}
            </TableTbody>
          </Table>
        </Box>

        {/* Mobile Card View */}
        <Stack hiddenFrom="md" gap="sm">
          {filteredData.length > 0 ? (
            filteredData.map((item) => (
              <Paper key={item.id} p="md" withBorder radius="sm">
                <Stack gap={4}>
                  <Box>
                    <Text fz="xs" fw={600} lh={1.4}>Nama</Text>
                    <Text fz="sm" fw={500} lh={1.5}>{item.nama}</Text>
                  </Box>
                  <Box>
                    <Text fz="xs" fw={600} lh={1.4}>Tanggal</Text>
                    <Text fz="sm" fw={500} lh={1.5}>
                      {new Date(item.tanggal).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </Text>
                  </Box>
                  <Box>
                    <Text fz="xs" fw={600} lh={1.4}>Jenis Kelamin</Text>
                    <Text fz="sm" fw={500} lh={1.5}>{item.jenisKelamin}</Text>
                  </Box>
                  <Box>
                    <Text fz="xs" fw={600} lh={1.4}>Alamat</Text>
                    <Text fz="sm" fw={500} lh={1.5} c="dimmed">{item.alamat}</Text>
                  </Box>
                  <Box>
                    <Button
                      variant="light"
                      color="blue"
                      fullWidth
                      onClick={() =>
                        router.push(
                          `/admin/kesehatan/data-kesehatan-warga/persentase_data_kelahiran_kematian/kelahiran/${item.id}`
                        )
                      }
                      size="sm"
                    >
                      <IconDeviceImacCog size={18} />
                      <Text ml="xs">Detail</Text>
                    </Button>
                  </Box>
                </Stack>
              </Paper>
            ))
          ) : (
            <Center py="lg">
              <Text c="dimmed" fz="sm" lh={1.4}>
                Tidak ada data kelahiran yang cocok
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
    </Stack>
  );
}

export default Kelahiran;