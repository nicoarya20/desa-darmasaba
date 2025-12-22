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
import kontakDarurat from '../../../_state/keamanan/kontak-darurat-keamanan';

function KontakDaruratKeamanan() {
  const [search, setSearch] = useState("");

  return (
    <Box>
      {/* Header Search */}
      <HeaderSearch
        title='Kontak Darurat Keamanan'
        placeholder='Cari kontak darurat, nama, atau nomor...'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />

      <ListKontakDaruratKeamanan search={search} />
    </Box>
  );
}

function ListKontakDaruratKeamanan({ search }: { search: string }) {
  const kontakState = useProxy(kontakDarurat.kontakDaruratKeamananState);
  const router = useRouter();
  const [debouncedSearch] = useDebouncedValue(search, 1000);

  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = kontakState.findMany;

  useShallowEffect(() => {
    load(page, 10, debouncedSearch);
    kontakDarurat.kontakDaruratItem.findMany.load();
  }, [page, debouncedSearch]);

  const filteredData = data || [];

  if (loading || !data) {
    return (
      <Stack py={{ base: 'md', md: 'lg' }}>
        <Skeleton height={600} radius="md" />
      </Stack>
    );
  }

  return (
    <Box py={{ base: 'md', md: 'lg' }}>
      <Paper withBorder bg={colors['white-1']} p={{ base: 'md', md: 'lg' }} shadow="md" radius="md">
        {/* Judul + Tombol Tambah */}
        <Group justify="space-between" mb={{ base: 'sm', md: 'md' }}>
          <Title order={4} lh={1.2}>
            Daftar Kontak Darurat Keamanan
          </Title>
          <Button
            leftSection={<IconPlus size={18} />}
            color="blue"
            variant="light"
            onClick={() => router.push('/admin/keamanan/kontak-darurat/kontak-darurat-keamanan/create')}
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
                <TableTh style={{ width: '30%' }}>Kontak Darurat</TableTh>
                <TableTh style={{ width: '25%' }}>Nama Kontak</TableTh>
                <TableTh style={{ width: '25%' }}>Nomor Telepon</TableTh>
                <TableTh style={{ width: '20%' }}>Aksi</TableTh>
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
                      <Text fz="sm" c="dimmed" lh={1.5} truncate lineClamp={1}>
                        {item.kategori?.nama}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Text fz="sm" c="dimmed" lh={1.5}>
                        {item.kategori?.nomorTelepon || "-"}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Button
                        variant="light"
                        color="blue"
                        onClick={() => router.push(`/admin/keamanan/kontak-darurat/kontak-darurat-keamanan/${item.id}`)}
                      >
                        <IconDeviceImacCog size={20} />
                        <Text ml={5} fz="sm" fw={500}>Detail</Text>
                      </Button>
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={4}>
                    <Center py={20}>
                      <Text c="dimmed" fz="sm" lh={1.4}>
                        Tidak ada data kontak darurat keamanan yang cocok
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
              filteredData.map((item) => (
                <Paper key={item.id} withBorder radius="md" p="md">
                  <Stack gap={"xs"}>
                    <Box>
                      <Text fz="sm" fw={600} lh={1.4}>Kontak Darurat</Text>
                      <Text fz="sm" fw={500} lh={1.45}>
                        {item.nama}
                      </Text>
                    </Box>
                    <Box>
                      <Text fz="sm" fw={600} lh={1.4}>Nama Kontak</Text>
                      <Text fz="sm" fw={500} lh={1.45} c="dimmed">
                        {item.kategori?.nama}
                      </Text>
                    </Box>
                    <Box>
                      <Text fz="sm" fw={600} lh={1.4}>Nomor Telepon</Text>
                      <Text fz="sm" fw={500} lh={1.45} c="dimmed">
                        {item.kategori?.nomorTelepon || "-"}
                      </Text>
                    </Box>
                    <Box>
                      <Button
                        fullWidth
                        variant="light"
                        color="blue"
                        onClick={() => router.push(`/admin/keamanan/kontak-darurat/kontak-darurat-keamanan/${item.id}`)}
                      >
                        <IconDeviceImacCog size={18} />
                        <Text ml={5} fz="sm" fw={500}>Detail</Text>
                      </Button>
                    </Box>
                  </Stack>
                </Paper>
              ))
            ) : (
              <Center py={20}>
                <Text c="dimmed" fz="sm" lh={1.4}>
                  Tidak ada data kontak darurat keamanan yang cocok
                </Text>
              </Center>
            )}
          </Stack>
        </Box>
      </Paper>

      {/* Pagination */}
      <Center>
        <Pagination
          value={page}
          onChange={(newPage) => {
            load(newPage, 10, search);
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

export default KontakDaruratKeamanan;