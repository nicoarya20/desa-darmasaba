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

function KontakItem() {
  const [search, setSearch] = useState("");

  return (
    <Box>
      {/* Header Search */}
      <HeaderSearch
        title='Kontak Darurat Item'
        placeholder='Cari kontak item, nama, atau nomor...'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />

      <ListKontakItem search={search} />
    </Box>
  );
}

function ListKontakItem({ search }: { search: string }) {
  const kontakState = useProxy(kontakDarurat.kontakDaruratItem);
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
  }, [page, debouncedSearch]);

  const filteredData = data || [];

  if (loading || !data) {
    return (
      <Stack py={{ base: 'sm', md: 'md' }}>
        <Skeleton height={600} radius="md" />
      </Stack>
    );
  }

  return (
    <Box py={{ base: 'sm', md: 'md' }}>
      <Paper withBorder bg={colors['white-1']} p={{ base: 'md', md: 'lg' }} shadow="md" radius="md">
        {/* Judul + Tombol Tambah */}
        <Group justify="space-between" mb={{ base: 'sm', md: 'md' }}>
          <Title order={4} lh={1.2}>
            Daftar Kontak Darurat Item
          </Title>
          <Button
            leftSection={<IconPlus size={18} />}
            color="blue"
            variant="light"
            onClick={() =>
              router.push('/admin/keamanan/kontak-darurat/kontak-darurat-item/create')
            }
          >
            Tambah Baru
          </Button>
        </Group>

        {/* Desktop: Table */}
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
                <TableTh style={{ width: '45%' }}>Nama Kontak</TableTh>
                <TableTh style={{ width: '35%' }}>Nomor Telepon</TableTh>
                <TableTh style={{ width: '20%' }}>Aksi</TableTh>
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
                      <Text fz="sm" c="dimmed" lh={1.5}>
                        {item.nomorTelepon || "-"}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Button
                        variant="light"
                        color="blue"
                        onClick={() =>
                          router.push(
                            `/admin/keamanan/kontak-darurat/kontak-darurat-item/${item.id}`
                          )
                        }
                        size="xs"
                      >
                        <IconDeviceImacCog size={16} />
                        <Text ml={4} fz="sm" fw={500}>
                          Detail
                        </Text>
                      </Button>
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={3}>
                    <Center py={24}>
                      <Text c="dimmed" fz="sm" lh={1.4}>
                        Tidak ada data kontak darurat item yang cocok
                      </Text>
                    </Center>
                  </TableTd>
                </TableTr>
              )}
            </TableTbody>
          </Table>
        </Box>

        {/* Mobile: Card */}
        <Stack hiddenFrom="md" gap="xs">
          {filteredData.length > 0 ? (
            filteredData.map((item) => (
              <Paper key={item.id} p="sm" withBorder radius="sm">
                <Stack gap={"xs"}>
                  <Box>
                    <Text fz="sm" fw={600} lh={1.4}>
                      Nama Kontak
                    </Text>
                    <Text fz="sm" fw={500} lh={1.4}>
                      {item.nama}
                    </Text>
                  </Box>
                  <Box>
                    <Text fz="sm" fw={600} lh={1.4}>
                      Nomor Telepon
                    </Text>
                    <Text fz="sm" fw={500} lh={1.4} c="dimmed">
                      {item.nomorTelepon || "-"}
                    </Text>
                  </Box>
                  <Box>
                    <Button
                      variant="light"
                      color="blue"
                      size="xs"
                      fullWidth
                      onClick={() =>
                        router.push(
                          `/admin/keamanan/kontak-darurat/kontak-darurat-item/${item.id}`
                        )
                      }
                    >
                      <IconDeviceImacCog size={16} />
                      <Text ml={4} fz="sm" fw={500}>
                        Detail
                      </Text>
                    </Button>
                  </Box>
                </Stack>
              </Paper>
            ))
          ) : (
            <Center py={24}>
              <Text c="dimmed" fz="sm" lh={1.4}>
                Tidak ada data kontak darurat item yang cocok
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

export default KontakItem;