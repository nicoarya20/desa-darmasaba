/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import colors from '@/con/colors';
import {
  Badge,
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
import { IconDeviceImacCog, IconPlus, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import stateStrukturPPID from '../../../_state/ppid/struktur_ppid/struktur_PPID';
import { useDebouncedValue } from '@mantine/hooks';

function PegawaiPPID() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      <HeaderSearch
        title='Pegawai PPID'
        placeholder='Cari nama pegawai atau posisi...'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListPegawaiPPID search={search} />
    </Box>
  );
}

function ListPegawaiPPID({ search }: { search: string }) {
  const stateOrganisasi = useProxy(stateStrukturPPID.pegawai);
  const router = useRouter();
    const [debouncedSearch] = useDebouncedValue(search, 1000);

  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = stateOrganisasi.findMany;

  useEffect(() => {
    load(page, 10, debouncedSearch);
  }, [page, debouncedSearch]);

  const filteredData = data || [];

  // Handle loading state
  if (loading || !data) {
    return (
      <Stack py="xl">
        <Skeleton height={300} radius="md" />
      </Stack>
    );
  }

  if (data.length === 0) {
    return (
      <Box py="xl">
        <Paper withBorder bg={colors['white-1']} p="lg" shadow="md" radius="md">
          <Group justify="space-between" mb="md">
            <Title order={4} lh={1.2}>
              Daftar Pegawai PPID
            </Title>
            <Button
              leftSection={<IconPlus size={18} />}
              color="blue"
              variant="light"
              onClick={() => router.push('/admin/ppid/struktur-ppid/pegawai/create')}
            >
              Tambah Baru
            </Button>
          </Group>
          <Center py="xl">
            <Text c="dimmed" fz={{ base: 'sm', md: 'md' }} lh={1.5}>
              Tidak ada data pegawai yang ditemukan
            </Text>
          </Center>
        </Paper>
      </Box>
    );
  }

  return (
    <Box py="xl">
      <Paper withBorder bg={colors['white-1']} p="lg" shadow="md" radius="md">
        <Group justify="space-between" mb="md">
          <Title order={4} lh={1.2}>
            Daftar Pegawai PPID
          </Title>
          <Button
            leftSection={<IconPlus size={18} />}
            color="blue"
            variant="light"
            onClick={() => router.push('/admin/ppid/struktur-ppid/pegawai/create')}
          >
            Tambah Baru
          </Button>
        </Group>

        {/* Desktop: Table */}
        <Box visibleFrom="md">
          <Table highlightOnHover miw={0}>
            <TableThead>
              <TableTr>
                <TableTh fz="sm" fw={600} lh={1.4}>
                  Nama Lengkap
                </TableTh>
                <TableTh fz="sm" fw={600} lh={1.4}>
                  Posisi
                </TableTh>
                <TableTh fz="sm" fw={600} lh={1.4}>
                  Status
                </TableTh>
                <TableTh fz="sm" fw={600} lh={1.4}>
                  Aksi
                </TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.map((item) => (
                <TableTr key={item.id}>
                  <TableTd>
                    <Text fz="md" fw={500} lh={1.5} truncate="end">
                      {item.namaLengkap}
                    </Text>
                  </TableTd>
                  <TableTd>
                    <Badge variant="light" color="blue" fz="sm" lh={1.4}>
                      {item.posisi?.nama || 'Belum diatur'}
                    </Badge>
                  </TableTd>
                  <TableTd>
                    <Badge color={item.isActive ? "green" : "red"} fz="sm" lh={1.4}>
                      {item.isActive ? "Aktif" : "Tidak Aktif"}
                    </Badge>
                  </TableTd>
                  <TableTd>
                    <Button
                      size="xs"
                      radius="md"
                      variant="light"
                      color="blue"
                      leftSection={<IconDeviceImacCog size={16} />}
                      onClick={() => router.push(`/admin/ppid/struktur-ppid/pegawai/${item.id}`)}
                      fz="sm"
                    >
                      Detail
                    </Button>
                  </TableTd>
                </TableTr>
              ))}
            </TableTbody>
          </Table>
        </Box>

        {/* Mobile: Card List */}
        <Stack hiddenFrom="md" gap="sm" mt="md">
          {filteredData.map((item) => (
            <Paper key={item.id} withBorder p="md" radius="md">
              <Stack gap={"xs"}>
               <Box>
                <Text fz="sm" fw={600} lh={1.4}>Nama Lengkap</Text>
                 <Text fz="md" fw={500} lh={1.4}>
                  {item.namaLengkap}
                </Text>
               </Box>
               <Box>
                <Text fz="sm" fw={600} lh={1.4}>Posisi</Text>
                <Badge variant="light" color="blue" fz="xs" lh={1.4}>
                  {item.posisi?.nama || 'Belum diatur'}
                </Badge>
               </Box>
               <Box>
                <Text fz="sm" fw={600} lh={1.4}>Status</Text>
                <Badge color={item.isActive ? "green" : "red"} fz="xs" lh={1.4}>
                  {item.isActive ? "Aktif" : "Tidak Aktif"}
                </Badge>
               </Box>
                <Button
                  size="xs"
                  radius="md"
                  variant="light"
                  color="blue"
                  leftSection={<IconDeviceImacCog size={16} />}
                  onClick={() => router.push(`/admin/ppid/struktur-ppid/pegawai/${item.id}`)}
                  fz="xs"
                >
                  Detail
                </Button>
              </Stack>
            </Paper>
          ))}
        </Stack>

        <Center mt="xl">
          <Pagination
            value={page}
            onChange={(newPage) => {
              load(newPage, 10);
              window.scrollTo(0, 0);
            }}
            total={totalPages}
            withEdges
            withControls
            radius="md"
          />
        </Center>
      </Paper>
    </Box>
  );
}

export default PegawaiPPID;