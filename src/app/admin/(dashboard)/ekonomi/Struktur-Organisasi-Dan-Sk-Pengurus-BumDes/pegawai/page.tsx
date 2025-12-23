/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import colors from '@/con/colors';
import { Badge, Box, Button, Center, Group, Pagination, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text, ThemeIcon, Title } from '@mantine/core';
import { IconCheck, IconDeviceImacCog, IconPlus, IconSearch, IconX } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import stateStrukturBumDes from '../../../_state/ekonomi/struktur-organisasi/struktur-organisasi';
import { useDebouncedValue } from '@mantine/hooks';

function PegawaiBumDes() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      <HeaderSearch
        title='Pegawai BUMDes'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListPegawaiBumdes search={search} />
    </Box>
  );
}

function ListPegawaiBumdes({ search }: { search: string }) {
  const stateOrganisasi = useProxy(stateStrukturBumDes.pegawai);
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
      <Stack py="md">
        <Skeleton height={300} />
      </Stack>
    );
  }

  if (data.length === 0) {
    return (
      <Box py="md">
        <Paper withBorder bg={colors['white-1']} p="lg" shadow="md" radius="md">
          <Group justify="space-between" mb="md">
            <Title order={2} visibleFrom="md">Daftar Pegawai BUMDes</Title>
            <Title order={3} hiddenFrom="md">Daftar Pegawai BUMDes</Title>
            <Button
              leftSection={<IconPlus size={18} />}
              color="blue"
              variant="light"
              onClick={() => router.push('/admin/ekonomi/Struktur-Organisasi-Dan-Sk-Pengurus-BumDes/pegawai/create')}
            >
              Tambah Baru
            </Button>
          </Group>
          <Center py="xl">
            <Text c="dimmed" fz={{ base: 'sm', md: 'md' }} ta="center">
              Tidak ada data pegawai yang ditemukan
            </Text>
          </Center>
        </Paper>
      </Box>
    );
  }

  const sortedData = [...filteredData].sort((a, b) => {
    if (a.isActive === b.isActive) {
      return a.namaLengkap.localeCompare(b.namaLengkap);
    }
    return Number(b.isActive) - Number(a.isActive);
  });

  return (
    <Box py="md">
      <Paper withBorder bg={colors['white-1']} p="lg" shadow="md" radius="md">
        <Group justify="space-between" mb="md">
          <Title order={2} visibleFrom="md">Daftar Pegawai BUMDes</Title>
          <Title order={3} hiddenFrom="md">Daftar Pegawai BUMDes</Title>
          <Button
            leftSection={<IconPlus size={18} />}
            color="blue"
            variant="light"
            onClick={() => router.push('/admin/ekonomi/Struktur-Organisasi-Dan-Sk-Pengurus-BumDes/pegawai/create')}
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
                <TableTh style={{ width: '35%' }}>Nama Lengkap</TableTh>
                <TableTh style={{ width: '30%' }}>Posisi</TableTh>
                <TableTh style={{ width: '20%' }}>Status</TableTh>
                <TableTh style={{ width: '15%' }}>Aksi</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {sortedData.map((item) => (
                <TableTr key={item.id}>
                  <TableTd>
                    <Text fw={500} fz="md" lh={1.45} truncate="end">
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
                      onClick={() => router.push(`/admin/ekonomi/Struktur-Organisasi-Dan-Sk-Pengurus-BumDes/pegawai/${item.id}`)}
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
        <Stack gap="sm" hiddenFrom="md">
          {sortedData.map((item) => (
            <Paper key={item.id} withBorder p="md" radius="md">
              <Stack gap="xs">
                <Box>
                  <Text fz="sm" fw={600} lh={1.4}>Nama Lengkap</Text>
                  <Text fz="sm" fw={500} lh={1.4}>
                    {item.namaLengkap}
                  </Text>
                </Box>
                <Box>
                  <Text fz="sm" fw={600} lh={1.4}>Posisi</Text>
                  <Text fz="sm" fw={500} lh={1.4}>
                    {item.posisi?.nama || 'Belum diatur'}
                  </Text>
                </Box>
                <Box>
                  <Text fz="sm" fw={600} lh={1.4}>Status</Text>
                  <Group gap="xs">
                    {item.isActive ? (
                      <Group gap="xs">
                        <ThemeIcon color="green" variant="light" size="sm">
                          <IconCheck size={14} />
                        </ThemeIcon>
                        <Text fz="sm" fw={500} c="green">Aktif</Text>
                      </Group>
                    ) : (
                      <Group gap="xs">
                        <ThemeIcon color="red" variant="light" size="sm">
                          <IconX size={14} />
                        </ThemeIcon>
                        <Text fz="sm" fw={500} c="red">Tidak Aktif</Text>
                      </Group>
                    )}
                  </Group>
                </Box>
                <Box>
                  <Button
                    size="xs"
                    radius="md"
                    variant="light"
                    color="blue"
                    leftSection={<IconDeviceImacCog size={16} />}
                    onClick={() => router.push(`/admin/ekonomi/Struktur-Organisasi-Dan-Sk-Pengurus-BumDes/pegawai/${item.id}`)}
                  >
                    Detail
                  </Button>
                </Box>
              </Stack>
            </Paper>
          ))}
        </Stack>

        <Center mt="lg">
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

export default PegawaiBumDes;