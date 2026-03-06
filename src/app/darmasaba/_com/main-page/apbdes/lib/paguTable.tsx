/* eslint-disable @typescript-eslint/no-explicit-any */
import { Paper, Table, Title, Text } from '@mantine/core';

function Section({ title, data }: any) {
  if (!data || data.length === 0) return null;

  return (
    <>
      <Table.Tr bg="gray.0">
        <Table.Td colSpan={2}>
          <Text fw={700} fz={{ base: 'xs', sm: 'sm' }}>{title}</Text>
        </Table.Td>
      </Table.Tr>

      {data.map((item: any) => (
        <Table.Tr key={item.id}>
          <Table.Td>
            <Text fz={{ base: 'xs', sm: 'sm' }} lineClamp={2}>
              {item.kode} - {item.uraian}
            </Text>
          </Table.Td>
          <Table.Td ta="right">
            <Text fz={{ base: 'xs', sm: 'sm' }} fw={500} style={{ whiteSpace: 'nowrap' }}>
              Rp {item.anggaran.toLocaleString('id-ID')}
            </Text>
          </Table.Td>
        </Table.Tr>
      ))}
    </>
  );
}

export default function PaguTable({ apbdesData }: any) {
  const items = apbdesData.items || [];

  const title =
    apbdesData.tahun
      ? `PAGU APBDes Tahun ${apbdesData.tahun}`
      : 'PAGU APBDes';

  const pendapatan = items.filter((i: any) => i.tipe === 'pendapatan');
  const belanja = items.filter((i: any) => i.tipe === 'belanja');
  const pembiayaan = items.filter((i: any) => i.tipe === 'pembiayaan');

  return (
    <Paper withBorder p={{ base: 'sm', sm: 'md' }} radius="md">
      <Title order={5} mb="md" fz={{ base: 'sm', sm: 'md' }}>{title}</Title>

      <Table.ScrollContainer minWidth={280}>
        <Table verticalSpacing="xs">
          <Table.Thead>
            <Table.Tr>
              <Table.Th fz={{ base: 'xs', sm: 'sm' }}>Uraian</Table.Th>
              <Table.Th ta="right" fz={{ base: 'xs', sm: 'sm' }}>Anggaran (Rp)</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            <Section title="1) PENDAPATAN" data={pendapatan} />
            <Section title="2) BELANJA" data={belanja} />
            <Section title="3) PEMBIAYAAN" data={pembiayaan} />
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Paper>
  );
}