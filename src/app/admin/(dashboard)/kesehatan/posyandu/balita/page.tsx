/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import balitaState from '@/app/admin/(dashboard)/_state/kesehatan/balita/balita';
import colors from '@/con/colors';
import {
  Badge,
  Box,
  Button,
  Center,
  Group,
  Pagination,
  Paper,
  Select,
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
import { useDebouncedValue } from '@mantine/hooks';
import { IconDeviceImacCog, IconPlus, IconSearch, IconTrash } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';

const STUNTING_COLORS: Record<string, string> = {
  NORMAL: 'green',
  ALERT: 'yellow',
  STUNTING: 'red',
};

function BalitaPage() {
  const [search, setSearch] = useState('');
  return (
    <Box>
      <HeaderSearch
        title="Balita Terdaftar"
        placeholder="Cari nama / NIK / ortu..."
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListBalita search={search} />
    </Box>
  );
}

function ListBalita({ search }: { search: string }) {
  const state = useProxy(balitaState);
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState('');
  const [debouncedSearch] = useDebouncedValue(search, 1000);

  const { data, page, totalPages, loading, load } = state.findMany;

  useEffect(() => {
    load(page, 10, debouncedSearch, statusFilter);
  }, [page, debouncedSearch, statusFilter]);

  const handleDelete = async (id: string, nama: string) => {
    if (!confirm(`Hapus data balita "${nama}"?`)) return;
    await state.delete.byId(id);
  };

  const filteredData = data || [];

  if (loading || !data) {
    return (
      <Stack py="md">
        <Skeleton h={600} radius="md" />
      </Stack>
    );
  }

  return (
    <Box py="md">
      <Paper withBorder bg={colors['white-1']} p="lg" shadow="md" radius="md">
        <Group justify="space-between" mb="lg">
          <Title order={4}>List Balita</Title>
          <Button
            leftSection={<IconPlus size={18} />}
            color="blue"
            variant="light"
            onClick={() => router.push('/admin/kesehatan/posyandu/balita/create')}
          >
            Tambah Baru
          </Button>
        </Group>

        <Group mb="md">
          <Select
            placeholder="Filter stunting"
            data={[
              { value: '', label: 'Semua' },
              { value: 'NORMAL', label: 'Normal' },
              { value: 'ALERT', label: 'Alert' },
              { value: 'STUNTING', label: 'Stunting' },
            ]}
            value={statusFilter}
            onChange={(v) => setStatusFilter(v ?? '')}
            radius="md"
            clearable
          />
        </Group>

        {/* Desktop Table */}
        <Box visibleFrom="md" style={{ overflowX: 'auto' }}>
          <Table highlightOnHover layout="fixed" withColumnBorders={false}>
            <TableThead>
              <TableTr>
                <TableTh w="18%">Nama</TableTh>
                <TableTh w="6%">JK</TableTh>
                <TableTh w="11%">Tgl Lahir</TableTh>
                <TableTh w="13%">Banjar</TableTh>
                <TableTh w="10%">Imunisasi</TableTh>
                <TableTh w="8%">Gizi</TableTh>
                <TableTh w="10%">Pemeriksaan</TableTh>
                <TableTh w="10%">Stunting</TableTh>
                <TableTh w="14%">Aksi</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((d) => (
                  <TableTr key={d.id}>
                    <TableTd>{d.nama}</TableTd>
                    <TableTd>{d.jenisKelamin}</TableTd>
                    <TableTd>
                      {d.tanggalLahir
                        ? new Date(d.tanggalLahir).toLocaleDateString('id-ID')
                        : '-'}
                    </TableTd>
                    <TableTd>{d.posyandu?.banjar?.name ?? '-'}</TableTd>
                    <TableTd>
                      <Badge color={d.imunisasiLengkap ? 'green' : 'red'} variant="light">
                        {d.imunisasiLengkap ? 'Lengkap' : 'Belum'}
                      </Badge>
                    </TableTd>
                    <TableTd>
                      <Badge color={d.giziBaik ? 'green' : 'orange'} variant="light">
                        {d.giziBaik ? 'Baik' : 'Kurang'}
                      </Badge>
                    </TableTd>
                    <TableTd>
                      <Badge color={d.pemeriksaanRutin ? 'green' : 'orange'} variant="light">
                        {d.pemeriksaanRutin ? 'Rutin' : 'Tidak'}
                      </Badge>
                    </TableTd>
                    <TableTd>
                      <Badge
                        color={STUNTING_COLORS[d.statusStunting] ?? 'gray'}
                        variant="light"
                      >
                        {d.statusStunting}
                      </Badge>
                    </TableTd>
                    <TableTd>
                      <Group gap="xs">
                        <Button
                          size="xs"
                          radius="md"
                          variant="light"
                          color="blue"
                          leftSection={<IconDeviceImacCog size={16} />}
                          onClick={() =>
                            router.push(`/admin/kesehatan/posyandu/balita/edit/${d.id}`)
                          }
                        >
                          Edit
                        </Button>
                        <Button
                          size="xs"
                          radius="md"
                          variant="light"
                          color="red"
                          leftSection={<IconTrash size={16} />}
                          onClick={() => handleDelete(d.id, d.nama)}
                          loading={state.delete.loading}
                        >
                          Hapus
                        </Button>
                      </Group>
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={9}>
                    <Center py="xl">
                      <Text c="dimmed" fz="sm" lh={1.4}>
                        Tidak ada data balita yang cocok
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
            filteredData.map((d) => (
              <Paper key={d.id} withBorder p="md" radius="md">
                <Box>
                  <Text fz="sm" fw={600} mb={4}>
                    {d.nama}
                  </Text>
                  <Group gap="xs" mb={4}>
                    <Text fz="xs" c="dimmed">
                      {d.jenisKelamin}
                    </Text>
                    <Text fz="xs" c="dimmed">·</Text>
                    <Text fz="xs" c="dimmed">
                      {d.tanggalLahir
                        ? new Date(d.tanggalLahir).toLocaleDateString('id-ID')
                        : '-'}
                    </Text>
                  </Group>
                  {d.posyandu?.banjar?.name && (
                    <Text fz="xs" c="dimmed" mb={4}>
                      Banjar: {d.posyandu.banjar.name}
                    </Text>
                  )}
                  <Group gap="xs" mb={8}>
                    <Badge
                      size="xs"
                      color={d.imunisasiLengkap ? 'green' : 'red'}
                      variant="light"
                    >
                      {d.imunisasiLengkap ? 'Imunisasi Lengkap' : 'Imunisasi Belum'}
                    </Badge>
                    <Badge
                      size="xs"
                      color={d.giziBaik ? 'green' : 'orange'}
                      variant="light"
                    >
                      Gizi {d.giziBaik ? 'Baik' : 'Kurang'}
                    </Badge>
                    <Badge
                      size="xs"
                      color={STUNTING_COLORS[d.statusStunting] ?? 'gray'}
                      variant="light"
                    >
                      {d.statusStunting}
                    </Badge>
                  </Group>
                  <Group gap="xs">
                    <Button
                      size="xs"
                      radius="md"
                      variant="light"
                      color="blue"
                      leftSection={<IconDeviceImacCog size={16} />}
                      onClick={() =>
                        router.push(`/admin/kesehatan/posyandu/balita/edit/${d.id}`)
                      }
                    >
                      Edit
                    </Button>
                    <Button
                      size="xs"
                      radius="md"
                      variant="light"
                      color="red"
                      leftSection={<IconTrash size={16} />}
                      onClick={() => handleDelete(d.id, d.nama)}
                      loading={state.delete.loading}
                    >
                      Hapus
                    </Button>
                  </Group>
                </Box>
              </Paper>
            ))
          ) : (
            <Center py="xl">
              <Text c="dimmed" fz="sm" lh={1.4}>
                Tidak ada data balita yang cocok
              </Text>
            </Center>
          )}
        </Stack>
      </Paper>

      <Center>
        <Pagination
          value={page}
          onChange={(newPage) => {
            load(newPage, 10, search, statusFilter);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          total={totalPages}
          mt="lg"
          mb="md"
          color="blue"
          radius="md"
        />
      </Center>
    </Box>
  );
}

export default BalitaPage;
