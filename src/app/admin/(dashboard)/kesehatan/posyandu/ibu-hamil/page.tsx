/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import ibuHamilState from '@/app/admin/(dashboard)/_state/kesehatan/ibu-hamil/ibuHamil';
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

const STATUS_COLORS: Record<string, string> = {
  AKTIF: 'green',
  MELAHIRKAN: 'blue',
  KEGUGURAN: 'gray',
  NONAKTIF: 'red',
};

function IbuHamilPage() {
  const [search, setSearch] = useState('');
  return (
    <Box>
      <HeaderSearch
        title="Ibu Hamil"
        placeholder="Cari nama / NIK..."
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListIbuHamil search={search} />
    </Box>
  );
}

function ListIbuHamil({ search }: { search: string }) {
  const state = useProxy(ibuHamilState);
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState('');
  const [debouncedSearch] = useDebouncedValue(search, 1000);

  const { data, page, totalPages, loading, load } = state.findMany;

  useEffect(() => {
    load(page, 10, debouncedSearch, statusFilter);
  }, [page, debouncedSearch, statusFilter]);

  const handleDelete = async (id: string, nama: string) => {
    if (!confirm(`Hapus data ibu hamil "${nama}"?`)) return;
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
          <Title order={4}>List Ibu Hamil</Title>
          <Button
            leftSection={<IconPlus size={18} />}
            color="blue"
            variant="light"
            onClick={() => router.push('/admin/kesehatan/posyandu/ibu-hamil/create')}
          >
            Tambah Baru
          </Button>
        </Group>

        <Group mb="md">
          <Select
            placeholder="Filter status"
            data={[
              { value: '', label: 'Semua Status' },
              { value: 'AKTIF', label: 'Aktif' },
              { value: 'MELAHIRKAN', label: 'Melahirkan' },
              { value: 'KEGUGURAN', label: 'Keguguran' },
              { value: 'NONAKTIF', label: 'Nonaktif' },
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
                <TableTh w="25%">Nama</TableTh>
                <TableTh w="18%">NIK</TableTh>
                <TableTh w="17%">Usia Kehamilan</TableTh>
                <TableTh w="15%">No. HP</TableTh>
                <TableTh w="12%">Status</TableTh>
                <TableTh w="13%">Aksi</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((d) => (
                  <TableTr key={d.id}>
                    <TableTd>{d.nama}</TableTd>
                    <TableTd>{d.nik || '-'}</TableTd>
                    <TableTd>{d.usiaKehamilan} minggu</TableTd>
                    <TableTd>{d.noHp || '-'}</TableTd>
                    <TableTd>
                      <Badge
                        color={STATUS_COLORS[d.status] ?? 'gray'}
                        variant="light"
                      >
                        {d.status}
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
                            router.push(`/admin/kesehatan/posyandu/ibu-hamil/edit/${d.id}`)
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
                  <TableTd colSpan={6}>
                    <Center py="xl">
                      <Text c="dimmed" fz="sm" lh={1.4}>
                        Tidak ada data ibu hamil yang cocok
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
                  <Group gap="xs" mb={6}>
                    <Text fz="xs" c="dimmed">
                      NIK: {d.nik || '-'}
                    </Text>
                    <Text fz="xs" c="dimmed">
                      ·
                    </Text>
                    <Text fz="xs" c="dimmed">
                      {d.usiaKehamilan} minggu
                    </Text>
                  </Group>
                  <Group gap="xs" mb={8}>
                    <Badge
                      size="xs"
                      color={STATUS_COLORS[d.status] ?? 'gray'}
                      variant="light"
                    >
                      {d.status}
                    </Badge>
                    {d.noHp && (
                      <Text fz="xs" c="dimmed">
                        {d.noHp}
                      </Text>
                    )}
                  </Group>
                  <Group gap="xs">
                    <Button
                      size="xs"
                      radius="md"
                      variant="light"
                      color="blue"
                      leftSection={<IconDeviceImacCog size={16} />}
                      onClick={() =>
                        router.push(`/admin/kesehatan/posyandu/ibu-hamil/edit/${d.id}`)
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
                Tidak ada data ibu hamil yang cocok
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

export default IbuHamilPage;
