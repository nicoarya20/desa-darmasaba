'use client'
import type { IndeksDesaItem } from '@/app/admin/(dashboard)/_state/indeks-desa/indeksDesa';
import { ActionIcon, Badge, Box, Group, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text } from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { INDEKS_DESA_ADMIN_TEXT as T } from './indeks-desa.text';

type Props = {
  items: readonly IndeksDesaItem[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

/** Tabel admin Indeks Desa: tahun, skor IDM, status, dan aksi (edit, hapus). */
export function IndeksDesaTable({ items, onEdit, onDelete }: Props) {
  return (
    <Box style={{ overflowX: 'auto' }}>
      <Table highlightOnHover miw={520}>
        <TableThead>
          <TableTr>
            <TableTh w={100}>{T.colTahun}</TableTh>
            <TableTh>{T.colIdm}</TableTh>
            <TableTh>{T.colStatus}</TableTh>
            <TableTh w={110}>{T.colAksi}</TableTh>
          </TableTr>
        </TableThead>
        <TableTbody>
          {items.map((item) => (
            <TableTr key={item.id}>
              <TableTd>
                <Text fw={600}>{item.tahun}</Text>
              </TableTd>
              <TableTd>{item.skorIdm}</TableTd>
              <TableTd>
                <Badge variant="light">{item.status}</Badge>
              </TableTd>
              <TableTd>
                <Group gap="xs" wrap="nowrap">
                  <ActionIcon variant="light" color="blue" aria-label={T.editLabel(item.tahun)} onClick={() => onEdit(item.id)}>
                    <IconEdit size={18} />
                  </ActionIcon>
                  <ActionIcon variant="light" color="red" aria-label={T.deleteLabel(item.tahun)} onClick={() => onDelete(item.id)}>
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
