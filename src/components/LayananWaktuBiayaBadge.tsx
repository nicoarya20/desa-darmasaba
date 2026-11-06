import { waktuBiayaLabel, type WaktuBiayaValue } from '@/lib/pelayanan-waktu-biaya';
import { Badge } from '@mantine/core';
import { IconCash, IconClock } from '@tabler/icons-react';

interface LayananWaktuBiayaBadgeProps extends WaktuBiayaValue {
  /** true bila ditaruh di atas gambar/latar gelap (kartu layanan dengan overlay). */
  onDark?: boolean;
}

/** Badge "⏱ 1 hari kerja • Gratis" / "Rp 50.000"; tidak merender apa pun bila waktu & biaya belum diisi. */
function LayananWaktuBiayaBadge({ estimasiWaktu, biaya, onDark = false }: LayananWaktuBiayaBadgeProps) {
  const label = waktuBiayaLabel({ estimasiWaktu, biaya });
  if (label === null) return null;

  const hasWaktu = Boolean(estimasiWaktu?.trim());
  return (
    <Badge
      variant={onDark ? 'white' : 'light'}
      color={onDark ? 'dark' : 'blue'}
      size="lg"
      radius="xl"
      tt="none"
      maw="100%"
      leftSection={hasWaktu ? <IconClock size={14} /> : <IconCash size={14} />}
    >
      {label}
    </Badge>
  );
}

export default LayananWaktuBiayaBadge;
