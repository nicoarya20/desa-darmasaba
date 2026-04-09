'use client';

import { Box, Paper, Table, Text, Title, Badge, Group } from '@mantine/core';
import colors from '@/con/colors';
import type { APBDesData } from './types';

// Helper: Format Rupiah, tapi jika 0 → tampilkan '-'
function formatRupiahOrEmpty(value: number): string {
  if (value === 0 || value === null || value === undefined) {
    return '-';
  }
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 2,
    style: 'decimal',
  }).format(value);
}

// Helper: Format Persentase, tapi jika 0 → tampilkan '-'
function formatPersentaseOrEmpty(value: number): string {
  if (value === 0 || value === null || value === undefined) {
    return '-';
  }
  return `${value.toFixed(2)}%`;
}

function getIndent(level: number) {
  return {
    paddingLeft: `${(level - 1) * 20}px`,
  };
}

interface APBDesTableProps {
  apbdesData: APBDesData;
}

function APBDesTable({ apbdesData }: APBDesTableProps) {
  // Handle case where apbdesData is null or undefined
  if (!apbdesData) {
    return (
      <Box pt={"xs"} pb="md" px={{ base: 'md', md: 100 }}>
        <Title order={4} c={colors['blue-button']} mb="sm">
          Rincian APBDes
        </Title>
        <Paper withBorder radius="md" shadow="xs" p="md">
          <Text>Tidak ada data APBDes tersedia.</Text>
        </Paper>
      </Box>
    );
  }

  const items = Array.isArray(apbdesData.items) ? apbdesData.items : [];

  // Show message if no items exist
  if (items.length === 0) {
    return (
      <Box pt={"xs"} pb="md" px={{ base: 'md', md: 100 }}>
        <Title order={4} c={colors['blue-button']} mb="sm">
          Rincian APBDes Tahun {apbdesData.tahun || 'N/A'}
        </Title>
        <Paper withBorder radius="md" shadow="xs" p="md">
          <Text>Tidak ada rincian anggaran tersedia untuk tahun ini.</Text>
        </Paper>
      </Box>
    );
  }

  const sortedItems = [...items].sort((a, b) => a.kode.localeCompare(b.kode));

  // Calculate totals
  const totalAnggaran = items.reduce((sum, item) => sum + (item.anggaran || 0), 0);
  // Use realisasi field (already mapped from totalRealisasi in transformAPBDesData)
  const totalRealisasi = items.reduce((sum, item) => sum + (item.realisasi || 0), 0);
  const totalSelisih = totalAnggaran - totalRealisasi;
  const totalPersentase = totalAnggaran > 0 ? (totalRealisasi / totalAnggaran) * 100 : 0;

  return (
    <Box pt={"xs"} pb="md" px={{ base: 'md', md: 100 }}>
      <Title order={4} c={colors['blue-button']} mb="sm">
        Rincian APBDes Tahun {apbdesData.tahun || 'N/A'}
      </Title>

      <Paper withBorder radius="md" shadow="xs" p="md">
        <Box style={{ overflowY: 'auto' }}>
          <Table withColumnBorders highlightOnHover>
            <Table.Thead bg="#2c5f78">
              <Table.Tr>
                <Table.Th c="white" style={{ width: '40%' }}>
                  Uraian
                </Table.Th>
                <Table.Th c="white" ta="right" style={{ width: '15%' }}>
                  Anggaran (Rp)
                </Table.Th>
                <Table.Th c="white" ta="right" style={{ width: '15%' }}>
                  Realisasi (Rp)
                </Table.Th>
                <Table.Th c="white" ta="right" style={{ width: '15%' }}>
                  Lebih/(Kurang) (Rp)
                </Table.Th>
                <Table.Th c="white" ta="center" style={{ width: '15%' }}>
                  Persentase (%)
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {sortedItems.map((item) => (
                <Table.Tr key={item.id}>
                  <Table.Td style={getIndent(item.level)}>
                    <Group gap="xs" align="flex-start">
                      <Text fw={item.level === 1 ? 'bold' : 'normal'}>{item.kode}</Text>
                      <Text fz="sm">{item.uraian}</Text>
                    </Group>
                  </Table.Td>
                  <Table.Td ta="right">{formatRupiahOrEmpty(item.anggaran)}</Table.Td>
                  <Table.Td ta="right">{formatRupiahOrEmpty(item.realisasi)}</Table.Td>
                  <Table.Td ta="right">
                    <Text c={item.selisih >= 0 ? 'green' : 'red'}>
                      {formatRupiahOrEmpty(item.selisih)}
                    </Text>
                  </Table.Td>
                  <Table.Td ta="center">
                    <Badge color={item.persentase >= 100 ? 'teal' : 'yellow'} size="sm">
                      {formatPersentaseOrEmpty(item.persentase)}
                    </Badge>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
            <Table.Tfoot bg="#e6f0f7">
              <Table.Tr>
                <Table.Th colSpan={1}>
                  <Text fw={700}>JUMLAH PENDAPATAN</Text>
                </Table.Th>
                <Table.Th ta="right">
                  <Text fw={700}>{formatRupiahOrEmpty(totalAnggaran)}</Text>
                </Table.Th>
                <Table.Th ta="right">
                  <Text fw={700}>{formatRupiahOrEmpty(totalRealisasi)}</Text>
                </Table.Th>
                <Table.Th ta="right">
                  <Text fw={700} c={totalSelisih >= 0 ? 'green' : 'red'}>
                    {formatRupiahOrEmpty(totalSelisih)}
                  </Text>
                </Table.Th>
                <Table.Th ta="center">
                  <Text fw={700}>{formatPersentaseOrEmpty(totalPersentase)}</Text>
                </Table.Th>
              </Table.Tr>
            </Table.Tfoot>
          </Table>
        </Box>
      </Paper>
    </Box>
  );
}

export default APBDesTable;