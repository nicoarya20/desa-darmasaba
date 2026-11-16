'use client';

import colors from '@/con/colors';
import { DINAMIKA_FIELDS, DINAMIKA_TAHUN_MAX, DINAMIKA_TAHUN_MIN, type DinamikaInput } from '@/lib/dinamika-penduduk';
import { Box, Button, Group, Loader, NumberInput, Paper, Stack, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

type Props = {
  title: string;
  value: DinamikaInput;
  onChange: (field: keyof DinamikaInput, value: number) => void;
  onReset: () => void;
  resetLabel: string;
  onSubmit: () => void;
  loading: boolean;
};

const toNumber = (val: string | number) => (typeof val === 'number' ? val : Number(val || 0));

/** Form tambah/edit Dinamika Penduduk: tahun + empat jumlah (kelahiran, kematian, pindah masuk, pindah keluar). */
export function DinamikaPendudukForm({ title, value, onChange, onReset, resetLabel, onSubmit, loading }: Props) {
  const router = useRouter();

  return (
    <Box px={{ base: 0, md: 'xs' }} py="xs">
      <Group mb="md">
        <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md" aria-label="Kembali">
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
        <Title order={4} ml="sm" c="dark">
          {title}
        </Title>
      </Group>

      <Paper
        w={{ base: '100%', md: '50%' }}
        bg={colors['white-1']}
        p="lg"
        radius="md"
        shadow="sm"
        style={{ border: '1px solid #e0e0e0' }}
      >
        <Stack gap="md">
          <NumberInput
            label="Tahun"
            description="Satu tahun hanya boleh punya satu data"
            value={value.tahun}
            onChange={(val) => onChange('tahun', toNumber(val))}
            min={DINAMIKA_TAHUN_MIN}
            max={DINAMIKA_TAHUN_MAX}
            allowDecimal={false}
            required
          />
          {DINAMIKA_FIELDS.map((f) => (
            <NumberInput
              key={f.key}
              label={`Jumlah ${f.label}`}
              description="Total selama satu tahun"
              value={value[f.key]}
              onChange={(val) => onChange(f.key, toNumber(val))}
              min={0}
              allowDecimal={false}
              allowNegative={false}
              thousandSeparator="."
              decimalSeparator=","
              required
            />
          ))}

          <Group justify="flex-end">
            <Button variant="outline" color="gray" radius="md" size="md" onClick={onReset} disabled={loading}>
              {resetLabel}
            </Button>
            <Button
              onClick={onSubmit}
              radius="md"
              size="md"
              disabled={loading}
              style={{
                background: loading
                  ? 'linear-gradient(135deg, #cccccc, #eeeeee)'
                  : `linear-gradient(135deg, ${colors['blue-button']}, #4facfe)`,
                color: '#fff',
                boxShadow: '0 4px 15px rgba(79, 172, 254, 0.4)',
              }}
            >
              {loading ? <Loader size="sm" color="white" /> : 'Simpan'}
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}
