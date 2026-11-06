import { KategoriEventBadge } from '@/components/KategoriEventBadge';
import colors from '@/con/colors';
import { warnaKategoriEvent } from '@/lib/agenda-desa';
import {
  formatRentangTanggal,
  STATUS_AGENDA_COLOR,
  STATUS_AGENDA_LABEL,
  statusAgenda,
} from '@/lib/agenda-desa-waktu';
import { Badge, Group, Paper, Stack, Text } from '@mantine/core';
import { IconCalendarEvent, IconMapPin } from '@tabler/icons-react';

type AgendaItem = {
  id: string;
  nama: string;
  tanggal: string | Date;
  tanggalSelesai?: string | Date | null;
  kategori: string;
  lokasi: string;
  deskripsi: string | null;
};

/** Kartu satu agenda: judul, tanggal, lokasi, badge kategori & status (akan datang/berlangsung/selesai). */
export function AgendaCard({ item, now }: { item: AgendaItem; now: Date }) {
  const status = statusAgenda(item, now);

  return (
    <Paper
      withBorder
      p="lg"
      radius="lg"
      shadow="sm"
      style={{
        borderLeft: `4px solid var(--mantine-color-${warnaKategoriEvent(item.kategori)}-6)`,
        opacity: status === 'selesai' ? 0.8 : 1,
      }}
    >
      <Stack gap="xs">
        <Group gap="xs">
          <KategoriEventBadge kategori={item.kategori} />
          <Badge variant="outline" color={STATUS_AGENDA_COLOR[status]}>
            {STATUS_AGENDA_LABEL[status]}
          </Badge>
        </Group>

        <Group gap="sm" align="flex-start" wrap="nowrap">
          <IconCalendarEvent
            size={22}
            color={colors['blue-button-5']}
            style={{ flexShrink: 0, marginTop: 2 }}
          />
          <Stack gap={4} style={{ minWidth: 0, flex: 1 }}>
            <Text fw={600} fz="md" lineClamp={2}>
              {item.nama}
            </Text>
            <Text fz="sm" c="dimmed">
              {formatRentangTanggal(item)}
            </Text>
            {item.deskripsi && (
              <Text fz="sm" c="dimmed" lineClamp={2} mt={2}>
                {item.deskripsi}
              </Text>
            )}
          </Stack>
        </Group>

        <Group gap={4} wrap="nowrap" align="flex-start">
          <IconMapPin size={14} color={colors['grey']['2']} style={{ flexShrink: 0, marginTop: 3 }} />
          <Text fz="sm" c="dimmed">
            {item.lokasi}
          </Text>
        </Group>
      </Stack>
    </Paper>
  );
}
