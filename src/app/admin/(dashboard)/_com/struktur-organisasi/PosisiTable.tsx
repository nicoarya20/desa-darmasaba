import { ActionIcon, Box, Group, Paper, Stack, Table, Text } from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { StatusBadge } from './StatusBadge';
import { atasanNama, type PosisiRow } from './struktur-admin.logic';
import { STRUKTUR_ADMIN_TEXT as T } from './struktur-admin.text';

type Props = {
  /** Daftar jabatan, sudah urut hierarki → urutan → nama (urutan API). */
  items: readonly PosisiRow[];
  onEdit: (id: string) => void;
  onDelete: (item: PosisiRow) => void;
};

function Actions({ item, onEdit, onDelete }: { item: PosisiRow } & Omit<Props, 'items'>) {
  return (
    <Group gap="xs" wrap="nowrap">
      <ActionIcon variant="light" color="green" aria-label={`${T.edit} ${item.nama}`} onClick={() => onEdit(item.id)}>
        <IconEdit size={18} />
      </ActionIcon>
      <ActionIcon variant="light" color="red" aria-label={`${T.delete} ${item.nama}`} onClick={() => onDelete(item)}>
        <IconTrash size={18} />
      </ActionIcon>
    </Group>
  );
}

/** Daftar jabatan dengan nama atasan dan jumlah pegawai: tabel di desktop, kartu di ponsel. */
export function PosisiTable({ items, onEdit, onDelete }: Props) {
  return (
    <>
      <Box visibleFrom="md" style={{ overflowX: 'auto' }}>
        <Table highlightOnHover layout="fixed">
          <Table.Thead>
            <Table.Tr>
              <Table.Th w="30%">{T.posisi.nama}</Table.Th>
              <Table.Th w="25%">{T.posisi.atasan}</Table.Th>
              <Table.Th>{T.posisi.hierarki}</Table.Th>
              <Table.Th>{T.posisi.urutan}</Table.Th>
              <Table.Th>{T.posisi.jumlahPegawai}</Table.Th>
              <Table.Th>{T.posisi.status}</Table.Th>
              <Table.Th>{T.posisi.aksi}</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {items.map((item) => (
              <Table.Tr key={item.id}>
                <Table.Td><Text fw={500}>{item.nama}</Text></Table.Td>
                <Table.Td>{atasanNama(item, items)}</Table.Td>
                <Table.Td>{item.hierarki}</Table.Td>
                <Table.Td>{item.urutan ?? T.empty}</Table.Td>
                <Table.Td>{item._count?.pegawai ?? 0}</Table.Td>
                <Table.Td><StatusBadge isActive={item.isActive} /></Table.Td>
                <Table.Td><Actions item={item} onEdit={onEdit} onDelete={onDelete} /></Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Box>

      <Stack hiddenFrom="md" gap="sm">
        {items.map((item) => (
          <Paper key={item.id} withBorder p="md" radius="md">
            <Stack gap={4}>
              <Text fw={600}>{item.nama}</Text>
              <Text fz="sm" c="dimmed">{T.posisi.atasan}: {atasanNama(item, items)}</Text>
              <Text fz="sm" c="dimmed">
                {T.posisi.hierarki} {item.hierarki} · {T.posisi.urutan} {item.urutan ?? T.empty} · {T.posisi.pegawaiCount(item._count?.pegawai ?? 0)}
              </Text>
              <Group justify="space-between" mt={4}>
                <StatusBadge isActive={item.isActive} />
                <Actions item={item} onEdit={onEdit} onDelete={onDelete} />
              </Group>
            </Stack>
          </Paper>
        ))}
      </Stack>
    </>
  );
}
