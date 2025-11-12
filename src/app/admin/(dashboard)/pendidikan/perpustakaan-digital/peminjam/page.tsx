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
import { useShallowEffect } from '@mantine/hooks';
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

  useShallowEffect(() => {
    load(page, 10, search);
  }, [page, search]);

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
    <Box py={10}>
      <Paper withBorder bg={colors['white-1']} p="lg" shadow="md" radius="md">
        <Title order={4} mb="md">Daftar Peminjam Buku</Title>
        <Box style={{ overflowX: 'auto' }}>
          <Table highlightOnHover>
            <TableThead>
              <TableTr>
                <TableTh style={{ width: '10%' }}>No</TableTh>
                <TableTh style={{ width: '25%' }}>Nama Peminjam</TableTh>
                <TableTh style={{ width: '25%' }}>Status</TableTh>
                <TableTh style={{ width: '25%' }}>Alamat</TableTh>
                <TableTh style={{ width: '25%' }}>Detail</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item, index) => (
                  <TableTr key={item.id}>
                    <TableTd>{index + 1}</TableTd>
                    <TableTd>
                      <Text truncate fz="sm">{item.nama}</Text>
                    </TableTd>
                    <TableTd>
                      {renderStatusBadge(item.status)}
                    </TableTd>
                    <TableTd>
                      {item.alamat}
                    </TableTd>
                    <TableTd>
                      <Button
                        variant="light"
                        color="green"
                        onClick={() =>
                          router.push(`/admin/pendidikan/perpustakaan-digital/peminjam/${item.id}`)
                        }
                      >
                        <IconDeviceImacCog size={20} />
                      </Button>
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={4}>
                    <Center py={20}>
                      <Text c="dimmed">
                        Tidak ada data Peminjam buku yang cocok
                      </Text>
                    </Center>
                  </TableTd>
                </TableTr>
              )}
            </TableTbody>
          </Table>
        </Box>
      </Paper>

      {totalPages > 1 && (
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
      )}
    </Box>
  );
}

export default PeminjamBuku;
