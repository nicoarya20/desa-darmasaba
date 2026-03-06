/* eslint-disable @typescript-eslint/no-explicit-any */
import { Paper, Table, Title, Badge, Text } from '@mantine/core';

export default function RealisasiTable({ apbdesData }: any) {
  const items = apbdesData.items || [];

  const title =
    apbdesData.tahun
      ? `REALISASI APBDes Tahun ${apbdesData.tahun}`
      : 'REALISASI APBDes';

  // Flatten: kumpulkan semua realisasi items
  const allRealisasiRows: Array<{ realisasi: any; parentItem: any }> = [];
  
  items.forEach((item: any) => {
    if (item.realisasiItems && item.realisasiItems.length > 0) {
      item.realisasiItems.forEach((realisasi: any) => {
        allRealisasiRows.push({ realisasi, parentItem: item });
      });
    }
  });

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Paper withBorder p="md" radius="md">
      <Title order={5} mb="md">{title}</Title>

      {allRealisasiRows.length === 0 ? (
        <Text fz="sm" c="dimmed" ta="center" py="md">
          Belum ada data realisasi
        </Text>
      ) : (
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Uraian</Table.Th>
              <Table.Th ta="right">Realisasi (Rp)</Table.Th>
              <Table.Th ta="center">%</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {allRealisasiRows.map(({ realisasi, parentItem }) => {
              const persentase = parentItem.anggaran > 0
                ? (realisasi.jumlah / parentItem.anggaran) * 100
                : 0;

              return (
                <Table.Tr key={realisasi.id}>
                  <Table.Td>
                    <Text>{realisasi.kode || '-'} - {realisasi.keterangan || '-'}</Text>
                  </Table.Td>
                  <Table.Td ta="right">
                    <Text fw={600} c="blue">
                      {formatRupiah(realisasi.jumlah || 0)}
                    </Text>
                  </Table.Td>
                  <Table.Td ta="center">
                    <Badge
                      color={
                        persentase >= 100
                          ? 'teal'
                          : persentase >= 60
                          ? 'yellow'
                          : 'red'
                      }
                    >
                      {persentase.toFixed(2)}%
                    </Badge>
                  </Table.Td>
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
      )}
    </Paper>
  );
}