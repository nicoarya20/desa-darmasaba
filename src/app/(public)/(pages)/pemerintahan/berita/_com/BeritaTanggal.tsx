import { Group, Text } from '@mantine/core';
import { IconCalendar } from '@tabler/icons-react';
import { formatTanggalTerbit, tanggalTerbitAtauDibuat } from '@/lib/tanggal-terbit';

/** Tanggal terbit berita di halaman detail publik (WITA; fallback createdAt untuk respons lama). */
export function BeritaTanggal({
  item,
}: {
  item: { tanggalTerbit?: Date | string | null; createdAt: Date | string };
}) {
  const tanggal = tanggalTerbitAtauDibuat(item);
  return (
    <Group gap={6} justify="center" c="dimmed" data-berita-tanggal>
      <IconCalendar size={16} />
      <Text component="time" dateTime={tanggal.toISOString()} fz="sm" c="dimmed">
        {formatTanggalTerbit(tanggal)}
      </Text>
    </Group>
  );
}
