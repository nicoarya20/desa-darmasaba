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
import ibuHamilState from '../../../_state/kesehatan/ibu-hamil/ibuHamil';


const STATUS_COLORS: Record<string, string> = {
  AKTIF: 'green',
  MELAHIRKAN: 'blue',
  KEGUGURAN: 'gray',
  NONAKTIF: 'red',
};

export default function IbuHamilPage() {
  const router = useRouter();
  const state = useProxy(ibuHamilState);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    state.findMany.load(1, 10, search, statusFilter);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = () => {
    state.findMany.load(1, 10, search, statusFilter);
  };

  const handleDelete = async (id: string, nama: string) => {
    if (!confirm(`Hapus data ibu hamil "${nama}"?`)) return;
    await state.delete.byId(id);
  };

  const rows = state.findMany.data?.map((d) => (
    <Table.Tr key={d.id}>
      <Table.Td>{d.nama}</Table.Td>
      <Table.Td>{d.nik || '-'}</Table.Td>
      <Table.Td>{d.usiaKehamilan} minggu</Table.Td>
      <Table.Td>{d.noHp || '-'}</Table.Td>
      <Table.Td>
        <Badge color={STATUS_COLORS[d.status] ?? 'gray'} variant="light">
          {d.status}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          <ActionIcon
            variant="light"
            color="blue"
            onClick={() => router.push(`/admin/kesehatan/posyandu/ibu-hamil/edit/${d.id}`)}
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
        <Title order={3} c="black">Ibu Hamil</Title>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => router.push('/admin/kesehatan/posyandu/ibu-hamil/create')}
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
          placeholder="Cari nama / NIK..."
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          radius="md"
          style={{ flex: 1, maxWidth: 300 }}
        />
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
                <Table.Th>NIK</Table.Th>
                <Table.Th>Usia Kehamilan</Table.Th>
                <Table.Th>No. HP</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Aksi</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rows && rows.length > 0 ? rows : (
                <Table.Tr>
                  <Table.Td colSpan={6}>
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
