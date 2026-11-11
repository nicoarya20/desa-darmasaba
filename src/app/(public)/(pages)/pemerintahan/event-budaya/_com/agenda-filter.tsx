import colors from '@/con/colors';
import { KATEGORI_EVENT_OPTIONS } from '@/lib/agenda-desa';
import { NAMA_BULAN } from '@/lib/agenda-desa-waktu';
import { Chip, Group, Select, Stack } from '@mantine/core';

export type AgendaFilterValue = {
  tahun: number | null; // null = semua tahun
  bulan: number | null; // null = semua bulan (hanya bermakna bila tahun dipilih)
  kategori: string | null; // null = semua kategori
};

const SEMUA_TAHUN = 'semua';

/** Filter publik agenda: Tahun, Bulan, dan chip Kategori. */
export function AgendaFilter({
  value,
  tahunOptions,
  onChange,
}: {
  value: AgendaFilterValue;
  tahunOptions: number[];
  onChange: (next: AgendaFilterValue) => void;
}) {
  const dataTahun = [
    { value: SEMUA_TAHUN, label: 'Semua tahun' },
    ...tahunOptions.map((t) => ({ value: String(t), label: String(t) })),
  ];
  const dataBulan = NAMA_BULAN.map((nama, i) => ({ value: String(i + 1), label: nama }));

  return (
    <Stack gap="sm" mb="lg">
      <Group gap="sm" grow preventGrowOverflow={false}>
        <Select
          label="Tahun"
          allowDeselect={false}
          data={dataTahun}
          value={value.tahun ? String(value.tahun) : SEMUA_TAHUN}
          onChange={(v) =>
            onChange({ ...value, tahun: !v || v === SEMUA_TAHUN ? null : Number(v), bulan: null })
          }
          style={{ minWidth: 140 }}
        />
        <Select
          label="Bulan"
          placeholder="Semua bulan"
          clearable
          disabled={!value.tahun}
          data={dataBulan}
          value={value.bulan ? String(value.bulan) : null}
          onChange={(v) => onChange({ ...value, bulan: v ? Number(v) : null })}
          style={{ minWidth: 140 }}
        />
      </Group>

      <Chip.Group
        multiple={false}
        value={value.kategori ?? ''}
        onChange={(v) => onChange({ ...value, kategori: typeof v === 'string' && v ? v : null })}
      >
        <Group gap="xs">
          <Chip value="" color={colors['blue-button']} variant="light" size="sm">
            Semua kategori
          </Chip>
          {KATEGORI_EVENT_OPTIONS.map((opt) => (
            <Chip key={opt.value} value={opt.value} color={colors['blue-button']} variant="light" size="sm">
              {opt.label}
            </Chip>
          ))}
        </Group>
      </Chip.Group>
    </Stack>
  );
}
