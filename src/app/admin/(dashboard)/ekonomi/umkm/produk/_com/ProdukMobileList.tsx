import { Badge, Box, Button, Group, Paper, Stack, Text } from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { UnggulanBadge } from '@/app/darmasaba/(pages)/ekonomi/umkm/_com/UnggulanBadge';

type ProdukItem = {
  id: string;
  nama: string;
  harga: number;
  stok: number;
  isUnggulan?: boolean;
  umkm?: { nama: string } | null;
};

type Props = {
  items: ProdukItem[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

/** Daftar produk UMKM versi kartu untuk layar mobile (pola tabel admin, DESIGN.md §9). */
export function ProdukMobileList({ items, onEdit, onDelete }: Props) {
  return (
    <Stack gap="sm">
      {items.map((item) => (
        <Paper key={item.id} withBorder p="sm" radius="md">
          <Stack gap="xs">
            <Group justify="space-between" align="flex-start" wrap="nowrap">
              <Text fw={600}>{item.nama}</Text>
              {item.isUnggulan && <UnggulanBadge size="sm" />}
            </Group>
            <Box>
              <Text size="xs" c="dimmed">UMKM</Text>
              <Text size="sm">{item.umkm?.nama || '-'}</Text>
            </Box>
            <Group justify="space-between">
              <Box>
                <Text size="xs" c="dimmed">Harga</Text>
                <Text size="sm">Rp {item.harga.toLocaleString()}</Text>
              </Box>
              <Box>
                <Text size="xs" c="dimmed">Stok</Text>
                <Badge color={item.stok < 5 ? 'red' : item.stok < 20 ? 'yellow' : 'green'}>
                  {item.stok}
                </Badge>
              </Box>
            </Group>
            <Group grow>
              <Button variant="light" color="blue" leftSection={<IconEdit size={16} />} onClick={() => onEdit(item.id)}>
                Edit
              </Button>
              <Button variant="light" color="red" leftSection={<IconTrash size={16} />} onClick={() => onDelete(item.id)}>
                Hapus
              </Button>
            </Group>
          </Stack>
        </Paper>
      ))}
    </Stack>
  );
}

export default ProdukMobileList;
