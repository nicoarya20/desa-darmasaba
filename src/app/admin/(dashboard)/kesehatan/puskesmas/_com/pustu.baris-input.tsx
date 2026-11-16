'use client'
import { ActionIcon, Box, Button, Group, Stack, Text, Textarea, TextInput } from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';

/** Satu kolom isian per baris (mis. "hari" atau "judul"). */
export type KolomBaris<K extends string> = { key: K; label: string; placeholder: string; maxLength: number; multiline?: boolean };

type Props<K extends string> = {
  label: string;
  description?: string;
  value: Record<K, string>[];
  onChange: (value: Record<K, string>[]) => void;
  kolom: readonly KolomBaris<K>[];
  tambahLabel: string;
  max: number;
};

/** Daftar baris isian dua kolom (jam operasional, layanan unggulan) dengan tombol tambah & hapus baris. */
export default function BarisInput<K extends string>({ label, description, value, onChange, kolom, tambahLabel, max }: Props<K>) {
  const ubah = (i: number, key: K, isi: string) => onChange(value.map((baris, j) => (j === i ? { ...baris, [key]: isi } : baris)));
  const kosong = Object.fromEntries(kolom.map((k) => [k.key, ''])) as Record<K, string>;

  return (
    <Box>
      <Text fw={500} fz="sm">{label}</Text>
      {description ? <Text c="dimmed" fz="xs" mb={6}>{description}</Text> : null}
      <Stack gap="xs">
        {value.map((baris, i) => (
          <Group key={i} align="flex-start" gap="xs" wrap="nowrap">
            {kolom.map((k) => {
              const props = {
                'aria-label': `${k.label} ${i + 1}`,
                placeholder: k.placeholder,
                maxLength: k.maxLength,
                value: baris[k.key],
                style: { flex: k.multiline ? 2 : 1 },
              };
              return k.multiline ? (
                <Textarea key={k.key} autosize minRows={1} {...props} onChange={(e) => ubah(i, k.key, e.currentTarget.value)} />
              ) : (
                <TextInput key={k.key} {...props} onChange={(e) => ubah(i, k.key, e.currentTarget.value)} />
              );
            })}
            <ActionIcon
              variant="light"
              color="red"
              size="lg"
              aria-label={`Hapus baris ${i + 1}`}
              onClick={() => onChange(value.filter((_, j) => j !== i))}
            >
              <IconTrash size={16} />
            </ActionIcon>
          </Group>
        ))}
        <Group>
          <Button
            variant="light"
            size="xs"
            leftSection={<IconPlus size={14} />}
            disabled={value.length >= max}
            onClick={() => onChange([...value, { ...kosong }])}
          >
            {tambahLabel}
          </Button>
        </Group>
      </Stack>
    </Box>
  );
}
