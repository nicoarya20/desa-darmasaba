/* eslint-disable @typescript-eslint/no-explicit-any */
import { Paper, Table, Title, Badge, Group, Text, Box, Collapse } from '@mantine/core';
import { useState } from 'react';
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react';

function RealisasiDetail({ realisasiItems }: { realisasiItems: any[] }) {
  if (!realisasiItems || realisasiItems.length === 0) {
    return (
      <Text fz="xs" c="dimmed" py="xs">
        Belum ada realisasi
      </Text>
    );
  }

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <Box mt="xs" p="xs" bg="gray.0" radius="md">
      <Text fz="xs" fw={600} mb="xs">
        Rincian Realisasi ({realisasiItems.length}):
      </Text>
      <>
        {realisasiItems.map((realisasi: any, idx: number) => (
          <Box key={realisasi.id} mb={idx < realisasiItems.length - 1 ? 'xs' : 0}>
            <Group justify="space-between" gap="xs" wrap="nowrap">
              <Text fz="xs" style={{ flex: 1 }}>
                {realisasi.keterangan || `Realisasi ${idx + 1}`}
              </Text>
              <Text fz="xs" fw={600} c="blue">
                {formatRupiah(realisasi.jumlah)}
              </Text>
              <Text fz="xs" c="dimmed">
                {formatDate(realisasi.tanggal)}
              </Text>
            </Group>
          </Box>
        ))}
      </>
    </Box>
  );
}

function ItemRow({ item, expanded, onToggle }: any) {
  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const hasRealisasi = item.realisasiItems && item.realisasiItems.length > 0;

  return (
    <>
      <Table.Tr
        onClick={onToggle}
        style={{ cursor: 'pointer', '&:hover': { backgroundColor: 'var(--mantine-color-gray-0)' } }}
      >
        <Table.Td>
          <Group gap="xs">
            {hasRealisasi ? (
              expanded ? (
                <IconChevronDown size={16} />
              ) : (
                <IconChevronRight size={16} />
              )
            ) : (
              <Box w={16} />
            )}
            <Text fw={500}>{item.kode} - {item.uraian}</Text>
          </Group>
        </Table.Td>
        <Table.Td ta="right">
          <Text fw={600} c="blue">
            {formatRupiah(item.totalRealisasi)}
          </Text>
        </Table.Td>
        <Table.Td ta="center">
          <Badge
            color={
              item.persentase >= 100
                ? 'teal'
                : item.persentase >= 60
                ? 'yellow'
                : 'red'
            }
          >
            {item.persentase.toFixed(2)}%
          </Badge>
        </Table.Td>
      </Table.Tr>
      <Table.Tr>
        <Table.Td colSpan={3} p={0}>
          <Collapse in={expanded}>
            {hasRealisasi && <RealisasiDetail realisasiItems={item.realisasiItems} />}
          </Collapse>
        </Table.Td>
      </Table.Tr>
    </>
  );
}

function Section({ title, data }: any) {
  if (!data || data.length === 0) return null;

  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <>
      <Table.Tr>
        <Table.Td colSpan={3}>
          <Text fw={700} fz="sm">{title}</Text>
        </Table.Td>
      </Table.Tr>

      {data.map((item: any) => (
        <ItemRow
          key={item.id}
          item={item}
          expanded={expandedId === item.id}
          onToggle={() => setExpandedId(expandedId === item.id ? null : item.id)}
        />
      ))}
    </>
  );
}

export default function RealisasiTable({ apbdesData }: any) {
  const items = apbdesData.items || [];

  const title =
    apbdesData.tahun
      ? `REALISASI APBDes Tahun ${apbdesData.tahun}`
      : 'REALISASI APBDes';

  const pendapatan = items.filter((i: any) => i.tipe === 'pendapatan');
  const belanja = items.filter((i: any) => i.tipe === 'belanja');
  const pembiayaan = items.filter((i: any) => i.tipe === 'pembiayaan');

  return (
    <Paper withBorder p="md" radius="md">
      <Title order={5} mb="md">{title}</Title>

      <Text fz="xs" c="dimmed" mb="sm">
        💡 Klik pada item untuk melihat detail realisasi
      </Text>

      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Uraian</Table.Th>
            <Table.Th ta="right">Total Realisasi (Rp)</Table.Th>
            <Table.Th ta="center">%</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          <Section title="1) PENDAPATAN" data={pendapatan} />
          <Section title="2) BELANJA" data={belanja} />
          <Section title="3) PEMBIAYAAN" data={pembiayaan} />
        </Table.Tbody>
      </Table>
    </Paper>
  );
}