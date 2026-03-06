'use client';
import colors from '@/con/colors';
import {
  Badge,
  Box,
  Button,
  Center,
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
import { IconDeviceImacCog, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import perpustakaanDigitalState from '../../../_state/pendidikan/perpustakaan-digital';

function PeminjamBuku() {
  const [search, setSearch] = useState('');
  return (
    <Box>
      <HeaderSearch
        title="Peminjam Buku"
        placeholder="Cari peminjam..."
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListPeminjamBuku search={search} />
    </Box>
  );
}

function ListPeminjamBuku({ search }: { search: string }) {
  const statePeminjam = useProxy(perpustakaanDigitalState.peminjamanBuku);
  const router = useRouter();

  const { data, page, totalPages, loading, load } = statePeminjam.findMany;
  const [debouncedSearch] = useDebouncedValue(search, 1000);

  useShallowEffect(() => {
    load(page, 10, debouncedSearch);
  }, [page, debouncedSearch]);

  const filteredData = data || [];

  // 🔹 Fungsi helper untuk badge status
  const renderStatusBadge = (status: string) => {
    const normalized = status?.toUpperCase();

    switch (normalized) {
      case 'DIPINJAM':
        return <Badge color="blue" variant="light">Dipinjam</Badge>;
      case 'DIKEMBALIKAN':
        return <Badge color="green" variant="light">Dikembalikan</Badge>;
      case 'TERLAMBAT':
        return <Badge color="orange" variant="light">Terlambat</Badge>;
      case 'DIBATALKAN':
        return <Badge color="red" variant="light">Dibatalkan</Badge>;
      default:
        return <Badge color="gray" variant="light">Tidak diketahui</Badge>;
    }
  };

  if (loading || !data) {
    return (
      <Stack py={10}>
        <Skeleton height={500} radius="md" />
      </Stack>
    );
  }

  return (
    <Box py={{ base: 'sm', md: 'lg' }}>
      <Paper withBorder bg={colors['white-1']} p={{ base: 'md', md: 'lg' }} shadow="md" radius="md">
        <Title order={4} lh={1.2} mb={{ base: 'md', md: 'lg' }}>
          Daftar Peminjam Buku
        </Title>

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
                <TableTh style={{ width: '8%' }}>No</TableTh>
                <TableTh style={{ width: '28%' }}>Nama Peminjam</TableTh>
                <TableTh style={{ width: '20%' }}>Status</TableTh>
                <TableTh style={{ width: '28%' }}>Alamat</TableTh>
                <TableTh style={{ width: '16%' }}>Detail</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item, index) => (
                  <TableTr key={item.id}>
                    <TableTd>
                      <Text fz="sm" lh={1.5}>
                        {index + 1}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Text fz="sm" lh={1.5} truncate>
                        {item.nama}
                      </Text>
                    </TableTd>
                    <TableTd>{renderStatusBadge(item.status)}</TableTd>
                    <TableTd>
                      <Text fz="sm" lh={1.5} truncate>
                        {item.alamat}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Button
                        variant="light"
                        color="green"
                        onClick={() =>
                          router.push(
                            `/admin/pendidikan/perpustakaan-digital/peminjam/${item.id}`
                          )
                        }
                        radius="md"
                      >
                        <IconDeviceImacCog size={20} />
                      </Button>
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={5}>
                    <Center py={32}>
                      <Text c="dimmed" fz="sm" lh={1.5}>
                        Tidak ada data Peminjam buku yang cocok
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
          <Stack gap="md">
            {filteredData.length > 0 ? (
              filteredData.map((item, index) => (
                <Paper
                  key={item.id}
                  withBorder
                  p="md"
                  radius="md"
                  bg={colors['white-1']}
                >
                  <Stack gap="xs">
                    <Box>
                      <Text fz="xs" fw={600} lh={1.4}>
                        No
                      </Text>
                      <Text fz="sm" fw={500} lh={1.4}>
                        {index + 1}
                      </Text>
                    </Box>
                    <Box>
                      <Text fz="xs" fw={600} lh={1.4}>
                        Nama Peminjam
                      </Text>
                      <Text fz="sm" fw={500} lh={1.4}>
                        {item.nama}
                      </Text>
                    </Box>
                    <Box>
                      <Text fz="xs" fw={600} lh={1.4}>
                        Status
                      </Text>
                      {renderStatusBadge(item.status)}
                    </Box>
                    <Box>
                      <Text fz="xs" fw={600} lh={1.4}>
                        Alamat
                      </Text>
                      <Text fz="sm" fw={500} lh={1.4}>
                        {item.alamat}
                      </Text>
                    </Box>
                    <Box>
                      <Text fz="xs" fw={600} lh={1.4}>
                        Detail
                      </Text>
                      <Button
                        variant="light"
                        color="green"
                        onClick={() =>
                          router.push(
                            `/admin/pendidikan/perpustakaan-digital/peminjam/${item.id}`
                          )
                        }
                        mt="xs"
                        radius="md"
                        fullWidth
                      >
                        <IconDeviceImacCog size={20} />
                      </Button>
                    </Box>
                  </Stack>
                </Paper>
              ))
            ) : (
              <Center py={32}>
                <Text c="dimmed" fz="sm" lh={1.5}>
                  Tidak ada data Peminjam buku yang cocok
                </Text>
              </Center>
            )}
          </Stack>
        </Box>
      </Paper>

        <Center mt={{ base: 'sm', md: 'lg' }}>
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

export default PeminjamBuku;