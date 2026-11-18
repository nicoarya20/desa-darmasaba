'use client'
import type { ProdukHukumItem } from '@/app/admin/(dashboard)/_state/desa/produkHukum';
import { labelKategoriProdukHukum } from '@/lib/produk-hukum';
import { ActionIcon, Badge, Box, Group, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text } from '@mantine/core';
import { IconEdit, IconExternalLink, IconTrash } from '@tabler/icons-react';
import { PRODUK_HUKUM_ADMIN_TEXT as T } from './produk-hukum.text';

type Props = {
  items: readonly ProdukHukumItem[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

/** Tabel admin Produk Hukum: judul + nomor, kategori, tahun, dan aksi (buka PDF bila ada, edit, hapus). */
export function ProdukHukumTable({ items, onEdit, onDelete }: Props) {
  return (
    <Box style={{ overflowX: 'auto' }}>
      <Table highlightOnHover miw={640}>
        <TableThead>
          <TableTr>
            <TableTh>{T.colJudul}</TableTh>
            <TableTh w={190}>{T.colKategori}</TableTh>
            <TableTh w={90}>{T.colTahun}</TableTh>
            <TableTh w={130}>{T.colAksi}</TableTh>
          </TableTr>
        </TableThead>
        <TableTbody>
          {items.map((item) => (
            <TableTr key={item.id}>
              <TableTd>
                <Text fw={600} lineClamp={2}>{item.judul}</Text>
                {item.nomor && <Text fz="xs" c="dimmed">{item.nomor}</Text>}
                {!item.file && <Text fz="xs" c="orange">{T.noFile}</Text>}
              </TableTd>
              <TableTd>
                <Badge variant="light">{labelKategoriProdukHukum(item.kategori)}</Badge>
              </TableTd>
              <TableTd>{item.tahun ?? '-'}</TableTd>
              <TableTd>
                <Group gap="xs" wrap="nowrap">
                  {item.file && (
                    <ActionIcon
                      component="a"
                      href={item.file.link}
                      target="_blank"
                      rel="noreferrer"
                      variant="light"
                      aria-label={T.openPdf(item.judul)}
                    >
                      <IconExternalLink size={18} />
                    </ActionIcon>
                  )}
                  <ActionIcon variant="light" color="blue" aria-label={T.editLabel(item.judul)} onClick={() => onEdit(item.id)}>
                    <IconEdit size={18} />
                  </ActionIcon>
                  <ActionIcon variant="light" color="red" aria-label={T.deleteLabel(item.judul)} onClick={() => onDelete(item.id)}>
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
