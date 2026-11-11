import { Avatar, Box, Button, Group, Paper, Stack, Table, Text } from '@mantine/core';
import { IconDeviceImacCog } from '@tabler/icons-react';
import { StatusBadge } from './StatusBadge';
import { tampil, type PegawaiRow } from './struktur-admin.logic';
import { STRUKTUR_ADMIN_TEXT as T } from './struktur-admin.text';

type Props = {
  items: readonly PegawaiRow[];
  onDetail: (id: string) => void;
};

function DetailButton({ id, onDetail }: { id: string; onDetail: (id: string) => void }) {
  return (
    <Button size="xs" radius="md" variant="light" color="blue" leftSection={<IconDeviceImacCog size={16} />} onClick={() => onDetail(id)}>
      {T.detail}
    </Button>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Text fz="xs" c="dimmed">{label}</Text>
      <Text fz="sm" fw={500}>{value}</Text>
    </Box>
  );
}

/** Daftar pegawai: tabel di desktop, kartu di ponsel. Field kosong tampil "—". */
export function PegawaiTable({ items, onDetail }: Props) {
  return (
    <>
      <Box visibleFrom="md" style={{ overflowX: 'auto' }}>
        <Table highlightOnHover layout="fixed">
          <Table.Thead>
            <Table.Tr>
              <Table.Th w="32%">{T.pegawai.namaLengkap}</Table.Th>
              <Table.Th>{T.pegawai.gelarAkademik}</Table.Th>
              <Table.Th>{T.pegawai.jabatan}</Table.Th>
              <Table.Th>{T.pegawai.telepon}</Table.Th>
              <Table.Th>{T.pegawai.status}</Table.Th>
              <Table.Th>{T.pegawai.aksi}</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {items.map((item) => (
              <Table.Tr key={item.id}>
                <Table.Td>
                  <Group gap="sm" wrap="nowrap">
                    <Avatar src={item.image?.link ?? null} alt="" radius="xl" size="sm" />
                    <Text fw={500} truncate="end">{item.namaLengkap}</Text>
                  </Group>
                </Table.Td>
                <Table.Td>{tampil(item.gelarAkademik)}</Table.Td>
                <Table.Td>{tampil(item.posisi?.nama)}</Table.Td>
                <Table.Td>{tampil(item.telepon)}</Table.Td>
                <Table.Td><StatusBadge isActive={item.isActive} /></Table.Td>
                <Table.Td><DetailButton id={item.id} onDetail={onDetail} /></Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Box>

      <Stack hiddenFrom="md" gap="sm">
        {items.map((item) => (
          <Paper key={item.id} withBorder p="md" radius="md">
            <Stack gap="xs">
              <Field label={T.pegawai.namaLengkap} value={item.namaLengkap} />
              <Field label={T.pegawai.gelarAkademik} value={tampil(item.gelarAkademik)} />
              <Field label={T.pegawai.jabatan} value={tampil(item.posisi?.nama)} />
              <Field label={T.pegawai.telepon} value={tampil(item.telepon)} />
              <StatusBadge isActive={item.isActive} />
              <DetailButton id={item.id} onDetail={onDetail} />
            </Stack>
          </Paper>
        ))}
      </Stack>
    </>
  );
}
