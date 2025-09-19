/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import colors from '@/con/colors';
import { Badge, Box, Button, Center, Group, Pagination, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text, ThemeIcon, Title, Tooltip } from '@mantine/core';
import { IconCheck, IconDeviceImacCog, IconPlus, IconSearch, IconX } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import stateStrukturPPID from '../../../_state/ppid/struktur_ppid/struktur_PPID';

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

  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = stateOrganisasi.findMany;

  useEffect(() => {
    load(page, 10, search);
  }, [page, search]);

  const filteredData = data || []

  // Handle loading state
  if (loading || !data) {
    return (
      <Stack py={10}>
        <Skeleton height={300} />
      </Stack>
    );
  }

  if (data.length === 0) {
    return (
      <Box py={10}>
        <Paper withBorder bg={colors['white-1']} p="lg" shadow="md" radius="md">
          <Group justify="space-between" mb="md">
            <Title order={4}>Daftar Pegawai PPID</Title>
            <Tooltip label="Tambah Pegawai Baru" withArrow>
              <Button
                leftSection={<IconPlus size={18} />}
                color="blue"
                variant="light"
                onClick={() => router.push('/admin/ppid/struktur-ppid/pegawai/create')}
              >
                Tambah Baru
              </Button>
            </Tooltip>
          </Group>
          <Center py="xl">
            <Text c="dimmed">Tidak ada data pegawai yang ditemukan</Text>
          </Center>
        </Paper>
      </Box>
    );
  }
  return (
    <Box py={10}>
      <Paper withBorder bg={colors['white-1']} p="lg" shadow="md" radius="md">
        <Group justify="space-between" mb="md">
          <Title order={4}>Daftar Pegawai PPID</Title>
          <Tooltip label="Tambah Pegawai Baru" withArrow>
            <Button
              leftSection={<IconPlus size={18} />}
              color="blue"
              variant="light"
              onClick={() => router.push('/admin/ppid/struktur-ppid/pegawai/create')}
            >
              Tambah Baru
            </Button>
          </Tooltip>
        </Group>
        <Box style={{ overflowX: "auto" }}>
          <Table highlightOnHover>
            <TableThead>
              <TableTr>
                <TableTh style={{ width: '25%' }}>Nama Lengkap</TableTh>
                <TableTh style={{ width: '20%' }}>Posisi</TableTh>
                <TableTh style={{ width: '10%' }}>Status</TableTh>
                <TableTh style={{ width: '10%' }}>Aksi</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {(() => {
                console.log('Rendering table with items:', stateOrganisasi.findMany.data);
                return null;
              })()}
              {([...filteredData]
                .sort((a, b) => {
                  if (a.isActive === b.isActive) {
                    return a.namaLengkap.localeCompare(b.namaLengkap); // kalau status sama, urut nama
                  }
                  return Number(b.isActive) - Number(a.isActive); // aktif duluan
                }) // Aktif di atas
              ).map((item) => (
                <TableTr key={item.id}>
                  <TableTd>
                    <Box w={200}>
                      <Text fw={500} truncate="end" lineClamp={1}>
                        {item.namaLengkap}
                      </Text>
                    </Box>
                  </TableTd>
                  <TableTd>
                    <Box w={200}>
                      <Badge variant="light" color="blue">
                        {item.posisi?.nama || 'Belum diatur'}
                      </Badge>
                    </Box>
                  </TableTd>
                  <TableTd>
                    <Group gap="xs" wrap="nowrap">
                      <Box visibleFrom="sm">
                        <Badge color={item.isActive ? "green" : "red"}>
                          {item.isActive ? "Aktif" : "Tidak Aktif"}
                        </Badge>
                      </Box>
                      <Box hiddenFrom="sm">
                        {item.isActive ? (
                          <ThemeIcon color="green" variant="light" size="sm">
                            <IconCheck size={16} />
                          </ThemeIcon>
                        ) : (
                          <ThemeIcon color="red" variant="light" size="sm">
                            <IconX size={16} />
                          </ThemeIcon>
                        )}
                      </Box>
                    </Group>
                  </TableTd>
                  <TableTd>
                    <Button
                      size="xs"
                      radius="md"
                      variant="light"
                      color="blue"
                      leftSection={<IconDeviceImacCog size={16} />}
                      onClick={() => router.push(`/admin/ppid/struktur-ppid/pegawai/${item.id}`)}
                    >
                      Detail
                    </Button>
                  </TableTd>
                </TableTr>
              ))}
            </TableTbody>
          </Table>
        </Box>
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

export default PegawaiPPID;
