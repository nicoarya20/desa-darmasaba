import { NAMA_BULAN } from '@/lib/agenda-desa-waktu';
import { Button, Group, Text } from '@mantine/core';

const SINGKATAN_BULAN_LENGTH = 3;

/** Ringkasan jumlah agenda per bulan pada tahun terpilih; tiap bulan berisi bisa diklik untuk memfilter. */
export function RingkasanBulan({
  tahun,
  jumlah,
  bulanAktif,
  onPilih,
}: {
  tahun: number;
  jumlah: number[];
  bulanAktif: number | null;
  onPilih: (bulan: number | null) => void;
}) {
  if (!jumlah.some((n) => n > 0)) return null;

  return (
    <Group gap="xs" mb="lg" role="group" aria-label={'Jumlah agenda per bulan tahun ' + tahun}>
      <Text fz="sm" fw={600} c="dimmed">
        Agenda {tahun}:
      </Text>
      {jumlah.map((n, i) =>
        n > 0 ? (
          <Button
            key={NAMA_BULAN[i]}
            size="compact-xs"
            radius="xl"
            variant={bulanAktif === i + 1 ? 'filled' : 'light'}
            onClick={() => onPilih(bulanAktif === i + 1 ? null : i + 1)}
            aria-pressed={bulanAktif === i + 1}
            aria-label={NAMA_BULAN[i] + ': ' + n + ' acara'}
          >
            {NAMA_BULAN[i].slice(0, SINGKATAN_BULAN_LENGTH)} · {n}
          </Button>
        ) : null,
      )}
    </Group>
  );
}
