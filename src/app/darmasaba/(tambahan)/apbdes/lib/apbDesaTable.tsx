// src/app/admin/(dashboard)/landing-page/APBDes/APBDesTable.tsx
'use client';

import { Box, Paper, Table, Text, Title, Badge, Group } from '@mantine/core';
import { useProxy } from 'valtio/utils';
import apbdes from '@/app/admin/(dashboard)/_state/landing-page/apbdes';
import colors from '@/con/colors';

interface APBDesItem {
  id: string;
  kode: string;
  uraian: string;
  anggaran: number;
  realisasi: number;
  selisih: number;
  persentase: number;
  level: number;
  tipe: 'pendapatan' | 'belanja' | 'pembiayaan';
}

interface APBDesData {
  id: string;
  tahun: number;
  items: APBDesItem[];
  image?: { id: string; url: string } | null;
  file?: { id: string; url: string } | null;
}

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

function APBDesTable() {
  const state = useProxy(apbdes);
  const data = state.findMany.data || [];

  // Get the first APBDes item
  const apbdesItem = data[0] as unknown as APBDesData | undefined;

  if (!apbdesItem) {
    return (
      <Box py="md" px={{ base: 'md', md: 100 }}>
        <Text c="dimmed">Belum ada data APBDes untuk ditampilkan.</Text>
      </Box>
    );
  }

  const items = Array.isArray(apbdesItem.items) ? apbdesItem.items : [];
  const sortedItems = [...items].sort((a, b) => a.kode.localeCompare(b.kode));

  // Calculate totals
  const totalAnggaran = items.reduce((sum, item) => sum + (item.anggaran || 0), 0);
  const totalRealisasi = items.reduce((sum, item) => sum + (item.realisasi || 0), 0);
  const totalSelisih = totalAnggaran - totalRealisasi;
  const totalPersentase = totalAnggaran > 0 ? (totalRealisasi / totalAnggaran) * 100 : 0;

  return (
    <Box py="md" px={{ base: 'md', md: 100 }}>
      <Title order={4} c={colors['blue-button']} mb="sm">
        Rincian APBDes Tahun {apbdesItem.tahun}
      </Title>

      <Paper withBorder radius="md" shadow="xs" p="md">
        <Box style={{overflowY: 'auto' }}>
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
                      <Text fz="sm" >
                        {item.uraian}
                      </Text>
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