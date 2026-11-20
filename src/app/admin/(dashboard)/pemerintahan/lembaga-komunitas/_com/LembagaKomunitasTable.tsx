'use client'
import type { LembagaKomunitasItem } from '@/app/admin/(dashboard)/_state/desa/lembagaKomunitas';
import { ActionIcon, Avatar, Badge, Box, Group, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text } from '@mantine/core';
import { IconEdit, IconPhoto, IconTrash } from '@tabler/icons-react';
import { LEMBAGA_KOMUNITAS_ADMIN_TEXT as T } from './lembaga-komunitas.text';

type Props = {
  items: readonly LembagaKomunitasItem[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

/** Tabel admin Lembaga & Komunitas: foto kecil, nama + ketua, jenis, urutan, dan aksi (edit, hapus). */
export function LembagaKomunitasTable({ items, onEdit, onDelete }: Props) {
  return (
    <Box style={{ overflowX: 'auto' }}>
      <Table highlightOnHover miw={640}>
        <TableThead>
          <TableTr>
            <TableTh w={70}>{T.colFoto}</TableTh>
            <TableTh>{T.colNama}</TableTh>
            <TableTh w={160}>{T.colJenis}</TableTh>
            <TableTh w={90}>{T.colUrutan}</TableTh>
            <TableTh w={110}>{T.colAksi}</TableTh>
          </TableTr>
        </TableThead>
        <TableTbody>
          {items.map((item) => (
            <TableTr key={item.id}>
              <TableTd>
                <Avatar src={item.foto?.link ?? null} alt={item.foto ? T.fotoLabel(item.nama) : ''} radius="md" size={44}>
                  <IconPhoto size={20} aria-label={T.noFoto} />
                </Avatar>
              </TableTd>
              <TableTd>
                <Text fw={600} lineClamp={2}>{item.nama}</Text>
                {item.ketua && <Text fz="xs" c="dimmed">{item.ketua}</Text>}
              </TableTd>
              <TableTd>
                <Badge variant="light">{item.jenis}</Badge>
              </TableTd>
              <TableTd>{item.urutan}</TableTd>
              <TableTd>
                <Group gap="xs" wrap="nowrap">
                  <ActionIcon variant="light" color="blue" aria-label={T.editLabel(item.nama)} onClick={() => onEdit(item.id)}>
                    <IconEdit size={18} />
                  </ActionIcon>
                  <ActionIcon variant="light" color="red" aria-label={T.deleteLabel(item.nama)} onClick={() => onDelete(item.id)}>
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
