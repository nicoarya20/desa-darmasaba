/* eslint-disable @typescript-eslint/no-explicit-any */
import { Paper, Table, Title, Badge } from '@mantine/core';

function Section({ title, data }: any) {
  if (!data || data.length === 0) return null;

  return (
    <>
      <Table.Tr>
        <Table.Td colSpan={3}>
          <strong>{title}</strong>
        </Table.Td>
      </Table.Tr>

      {data.map((item: any) => (
        <Table.Tr key={item.id}>
          <Table.Td>
            {item.kode} - {item.uraian}
          </Table.Td>
          <Table.Td ta="right">
            Rp {item.totalRealisasi.toLocaleString('id-ID')}
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

      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Uraian</Table.Th>
            <Table.Th ta="right">Realisasi (Rp)</Table.Th>
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