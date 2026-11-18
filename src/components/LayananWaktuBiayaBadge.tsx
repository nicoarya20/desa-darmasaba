import { waktuBiayaLabel, type WaktuBiayaValue } from '@/lib/pelayanan-waktu-biaya';
import colors from '@/con/colors';
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
      // Biru brand (bukan 'blue' bawaan Mantine #228be6 yang hanya 3,2:1 di latar badge) agar teks lulus WCAG AA.
      color={onDark ? 'dark' : colors['blue-button']}
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
