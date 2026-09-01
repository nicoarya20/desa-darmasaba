'use client';

/**
 * Schedule builder untuk field "Jadwal Pelayanan" Posyandu.
 * Drop-in pengganti rich text editor: props `value` (JSON string) + `onChange`.
 * Admin memilih hari (Senin–Jumat / Sabtu–Minggu / Libur) dan jam buka/tutup.
 */

import {
  JADWAL_HARI_OPTIONS,
  JadwalEntry,
  JadwalHari,
  parseJadwal,
  stringifyJadwal,
} from '@/lib/jadwal-pelayanan';
import { ActionIcon, Button, Group, Select, Stack } from '@mantine/core';
import { TimeInput } from '@mantine/dates';
import { IconClock, IconPlus, IconTrash } from '@tabler/icons-react';
import { useEffect, useRef, useState } from 'react';

interface JadwalPelayananInputProps {
  value: string;
  onChange: (jsonValue: string) => void;
}

const blankRow = (): JadwalEntry => ({ hari: 'senin-jumat', buka: '', tutup: '' });

function JadwalPelayananInput({ value, onChange }: JadwalPelayananInputProps) {
  const [rows, setRows] = useState<JadwalEntry[]>(() => {
    const parsed = parseJadwal(value);
    return parsed.length ? parsed : [blankRow()];
  });
  // Nilai terakhir yang kita emit; dipakai untuk mengabaikan echo dari parent
  const lastEmitted = useRef<string | null>(null);

  // Sinkronkan bila `value` berubah dari luar (mis. data ter-load di halaman edit)
  useEffect(() => {
    if (value === lastEmitted.current) return;
    const parsed = parseJadwal(value);
    setRows(parsed.length ? parsed : [blankRow()]);
  }, [value]);

  const commit = (next: JadwalEntry[]) => {
    setRows(next);
    const out = stringifyJadwal(next);
    lastEmitted.current = out;
    onChange(out);
  };

  const updateRow = (index: number, patch: Partial<JadwalEntry>) => {
    commit(
      rows.map((row, i) => {
        if (i !== index) return row;
        const merged = { ...row, ...patch };
        // Kosongkan jam saat memilih Libur
        if (merged.hari === 'libur') return { hari: 'libur', buka: '', tutup: '' };
        return merged;
      })
    );
  };

  const addRow = () => commit([...rows, blankRow()]);
  const removeRow = (index: number) =>
    commit(rows.length > 1 ? rows.filter((_, i) => i !== index) : [blankRow()]);

  return (
    <Stack gap="sm">
      {rows.map((row, index) => (
        <JadwalRow
          key={index}
          row={row}
          showLabels={index === 0}
          canDelete={rows.length > 1}
          onChangeHari={(hari) => updateRow(index, { hari })}
          onChangeBuka={(buka) => updateRow(index, { buka })}
          onChangeTutup={(tutup) => updateRow(index, { tutup })}
          onDelete={() => removeRow(index)}
        />
      ))}
      <Group>
        <Button
          variant="light"
          size="sm"
          radius="md"
          leftSection={<IconPlus size={16} />}
          onClick={addRow}
        >
          Tambah jadwal
        </Button>
      </Group>
    </Stack>
  );
}

interface JadwalRowProps {
  row: JadwalEntry;
  showLabels: boolean;
  canDelete: boolean;
  onChangeHari: (hari: JadwalHari) => void;
  onChangeBuka: (buka: string) => void;
  onChangeTutup: (tutup: string) => void;
  onDelete: () => void;
}

function JadwalRow({
  row,
  showLabels,
  canDelete,
  onChangeHari,
  onChangeBuka,
  onChangeTutup,
  onDelete,
}: JadwalRowProps) {
  const refBuka = useRef<HTMLInputElement>(null);
  const refTutup = useRef<HTMLInputElement>(null);
  const isLibur = row.hari === 'libur';

  const picker = (ref: React.RefObject<HTMLInputElement | null>) => (
    <ActionIcon variant="subtle" color="gray" onClick={() => ref.current?.showPicker()}>
      <IconClock size={16} stroke={1.5} />
    </ActionIcon>
  );

  return (
    <Group align="flex-end" wrap="wrap" gap="sm">
      <Select
        label={showLabels ? 'Hari' : undefined}
        data={JADWAL_HARI_OPTIONS}
        value={row.hari}
        onChange={(val) => val && onChangeHari(val as JadwalHari)}
        allowDeselect={false}
        w={{ base: '100%', xs: 160 }}
      />
      <TimeInput
        label={showLabels ? 'Jam Buka' : undefined}
        ref={refBuka}
        rightSection={picker(refBuka)}
        value={row.buka ?? ''}
        onChange={(e) => onChangeBuka(e.currentTarget.value)}
        disabled={isLibur}
        w={{ base: '100%', xs: 130 }}
      />
      <TimeInput
        label={showLabels ? 'Jam Tutup' : undefined}
        ref={refTutup}
        rightSection={picker(refTutup)}
        value={row.tutup ?? ''}
        onChange={(e) => onChangeTutup(e.currentTarget.value)}
        disabled={isLibur}
        w={{ base: '100%', xs: 130 }}
      />
      <ActionIcon
        variant="light"
        color="red"
        size="lg"
        radius="md"
        onClick={onDelete}
        disabled={!canDelete}
        aria-label="Hapus jadwal"
      >
        <IconTrash size={18} />
      </ActionIcon>
    </Group>
  );
}

export default JadwalPelayananInput;
