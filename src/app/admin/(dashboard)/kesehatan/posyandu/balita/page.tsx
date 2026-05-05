'use client';

import colors from '@/con/colors';
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Group,
  Loader,
  Pagination,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { IconEdit, IconPlus, IconSearch, IconTrash } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import balitaState from '../../../_state/kesehatan/balita/balita';


const STUNTING_COLORS: Record<string, string> = {
  NORMAL: 'green',
  ALERT: 'yellow',
  STUNTING: 'red',
};

export default function BalitaPage() {
  const router = useRouter();
  const state = useProxy(balitaState);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    state.findMany.load(1, 10, search, statusFilter);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = () => {
    state.findMany.load(1, 10, search, statusFilter);
  };

  const handleDelete = async (id: string, nama: string) => {
    if (!confirm(`Hapus data balita "${nama}"?`)) return;
    await state.delete.byId(id);
  };

  const rows = state.findMany.data?.map((d) => (
    <Table.Tr key={d.id}>
      <Table.Td>{d.nama}</Table.Td>
      <Table.Td>{d.jenisKelamin}</Table.Td>
      <Table.Td>
        {d.tanggalLahir
          ? new Date(d.tanggalLahir).toLocaleDateString('id-ID')
          : '-'}
      </Table.Td>
      <Table.Td>
        <Badge color={d.imunisasiLengkap ? 'green' : 'red'} variant="light">
          {d.imunisasiLengkap ? 'Lengkap' : 'Belum'}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Badge color={d.giziBaik ? 'green' : 'orange'} variant="light">
          {d.giziBaik ? 'Baik' : 'Kurang'}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Badge color={d.pemeriksaanRutin ? 'green' : 'orange'} variant="light">
          {d.pemeriksaanRutin ? 'Rutin' : 'Tidak'}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Badge color={STUNTING_COLORS[d.statusStunting] ?? 'gray'} variant="light">
          {d.statusStunting}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          <ActionIcon
            variant="light"
            color="blue"
            onClick={() => router.push(`/admin/kesehatan/posyandu/balita/edit/${d.id}`)}
          >
            <IconEdit size={16} />
          </ActionIcon>
          <ActionIcon
            variant="light"
            color="red"
            onClick={() => handleDelete(d.id, d.nama)}
            loading={state.delete.loading}
          >
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Box px={{ base: 0, md: 'lg' }} py="xs">
      <Group justify="space-between" mb="md">
        <Title order={3} c="black">Balita Terdaftar</Title>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => router.push('/admin/kesehatan/posyandu/balita/create')}
          radius="md"
          style={{
            background: `linear-gradient(135deg, ${colors['blue-button']}, #4facfe)`,
            color: '#fff',
          }}
        >
          Tambah
        </Button>
      </Group>

      <Group mb="md" gap="sm">
        <TextInput
          placeholder="Cari nama / NIK / ortu..."
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          radius="md"
          style={{ flex: 1, maxWidth: 300 }}
        />
        <Select
          placeholder="Filter stunting"
          data={[
            { value: '', label: 'Semua' },
            { value: 'NORMAL', label: 'Normal' },
            { value: 'ALERT', label: 'Alert' },
            { value: 'STUNTING', label: 'Stunting' },
          ]}
          value={statusFilter}
          onChange={(v) => {
            setStatusFilter(v ?? '');
            state.findMany.load(1, 10, search, v ?? '');
          }}
          radius="md"
          clearable
        />
        <Button onClick={handleSearch} radius="md" variant="light">Cari</Button>
      </Group>

      {state.findMany.loading ? (
        <Group justify="center" py="xl"><Loader /></Group>
      ) : (
        <Stack gap="md">
          <Table striped highlightOnHover withTableBorder>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Nama</Table.Th>
                <Table.Th>JK</Table.Th>
                <Table.Th>Tgl Lahir</Table.Th>
                <Table.Th>Imunisasi</Table.Th>
                <Table.Th>Gizi</Table.Th>
                <Table.Th>Pemeriksaan</Table.Th>
                <Table.Th>Stunting</Table.Th>
                <Table.Th>Aksi</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rows && rows.length > 0 ? rows : (
                <Table.Tr>
                  <Table.Td colSpan={8}>
                    <Text c="dimmed" ta="center" py="md">Tidak ada data</Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>

          {(state.findMany.totalPages ?? 1) > 1 && (
            <Group justify="center">
              <Pagination
                total={state.findMany.totalPages}
                value={state.findMany.page}
                onChange={(p) => state.findMany.load(p, 10, search, statusFilter)}
              />
            </Group>
          )}
        </Stack>
      )}
    </Box>
  );
}
