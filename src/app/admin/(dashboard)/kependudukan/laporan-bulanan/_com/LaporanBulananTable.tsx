'use client'
import type { LaporanBulananItem } from '@/app/admin/(dashboard)/_state/kependudukan/laporan-bulanan';
import { bulanLabel, totalPenduduk } from '@/app/api/[[...slugs]]/_lib/kependudukan/laporan-bulanan/laporan-bulanan.rules';
import { ActionIcon, Box, Center, Group, Skeleton, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text } from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons-react';

type Props = {
  rows: readonly LaporanBulananItem[];
  loading: boolean;
  deleting: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

const fmt = (n: number) => n.toLocaleString('id-ID');

/** Tabel laporan bulanan: banjar, periode (nama bulan + tahun), L, P, total L+P, aksi edit/hapus. */
export default function LaporanBulananTable({ rows, loading, deleting, onEdit, onDelete }: Props) {
  if (loading) return <Skeleton height={400} radius="md" />;
  if (rows.length === 0) {
    return (
      <Center py="xl">
        <Text c="dimmed" fz="sm">Belum ada laporan bulanan yang cocok.</Text>
      </Center>
    );
  }
  return (
    <Box style={{ overflowX: 'auto' }}>
      <Table highlightOnHover miw={640}>
        <TableThead>
          <TableTr>
            <TableTh>Banjar</TableTh>
            <TableTh w={160}>Periode</TableTh>
            <TableTh w={100} ta="right">Laki-laki</TableTh>
            <TableTh w={100} ta="right">Perempuan</TableTh>
            <TableTh w={100} ta="right">Total</TableTh>
            <TableTh w={100}>Aksi</TableTh>
          </TableTr>
        </TableThead>
        <TableTbody>
          {rows.map((r) => (
            <TableTr key={r.id}>
              <TableTd><Text fw={600} lineClamp={2}>{r.banjar}</Text></TableTd>
              <TableTd>{bulanLabel(r.bulan)} {r.tahun}</TableTd>
              <TableTd ta="right">{fmt(r.lakiLaki)}</TableTd>
              <TableTd ta="right">{fmt(r.perempuan)}</TableTd>
              <TableTd ta="right" fw={700}>{fmt(totalPenduduk(r))}</TableTd>
              <TableTd>
                <Group gap="xs" wrap="nowrap">
                  <ActionIcon variant="light" color="blue" aria-label={`Edit laporan ${r.banjar}`} onClick={() => onEdit(r.id)}>
                    <IconEdit size={18} />
                  </ActionIcon>
                  <ActionIcon variant="light" color="red" aria-label={`Hapus laporan ${r.banjar}`} disabled={deleting} onClick={() => onDelete(r.id)}>
                    <IconTrash size={18} />
                  </ActionIcon>
                </Group>
              </TableTd>
            </TableTr>
          ))}
        </TableTbody>
      </Table>
    </Box>
  );
}
