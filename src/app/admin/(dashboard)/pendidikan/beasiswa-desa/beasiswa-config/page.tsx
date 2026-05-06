/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import colors from '@/con/colors';
import {
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Group,
  NumberInput,
  Paper,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { IconCash, IconCalendar, IconUsers, IconDeviceFloppy, IconRefresh } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import ringkasanBeasiswaState from '../../../_state/pendidikan/ringkasan-beasiswa';

function formatRupiah(value: string | number) {
  const num = typeof value === 'string' ? parseInt(value, 10) : value;
  if (isNaN(num)) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
}

export default function BeasiswaConfigPage() {
  const state = useProxy(ringkasanBeasiswaState);

  const [tahunAjaran, setTahunAjaran] = useState('');
  const [danaTersalurkan, setDanaTersalurkan] = useState<number | string>('');

  useEffect(() => {
    state.beasiswaConfig.find();
    state.findStats.load();
  }, []);

  useEffect(() => {
    const cfg = state.beasiswaConfig.data;
    if (cfg) {
      setTahunAjaran(cfg.tahunAjaran);
      setDanaTersalurkan(parseInt(cfg.danaTersalurkan, 10) || 0);
    }
  }, [state.beasiswaConfig.data]);

  const handleSave = async () => {
    await state.beasiswaConfig.update.submit(
      tahunAjaran,
      String(danaTersalurkan),
    );
  };

  const isLoading = state.beasiswaConfig.loading;
  const isSaving = state.beasiswaConfig.update.loading;
  const stats = state.findStats.data;

  return (
    <Stack gap="lg">
      {/* ─── Header ─── */}
      <Group justify="space-between" align="center">
        <Box>
          <Title order={4} fw={700} c="#1A1B1E">Konfigurasi Beasiswa</Title>
          <Text size="sm" c="dimmed" mt={2}>Atur tahun ajaran aktif dan total dana yang tersalurkan</Text>
        </Box>
        <Badge color="blue" variant="light" size="lg" radius="md">
          Tahun Aktif: {stats?.tahunAjaran ?? '-'}
        </Badge>
      </Group>

      {/* ─── Stats Cards ─── */}
      {state.findStats.loading ? (
        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
          <Skeleton height={90} radius="md" />
          <Skeleton height={90} radius="md" />
          <Skeleton height={90} radius="md" />
        </SimpleGrid>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
          <Card withBorder radius="md" p="md">
            <Group gap="sm">
              <Box p={8} style={{ background: '#e7f5ff', borderRadius: 8 }}>
                <IconUsers size={20} color={colors['blue-button']} />
              </Box>
              <Box>
                <Text size="xs" c="dimmed" fw={500}>Jumlah Penerima</Text>
                <Text size="xl" fw={700} c={colors['blue-button']}>{stats?.jumlahPenerima ?? 0}</Text>
              </Box>
            </Group>
          </Card>

          <Card withBorder radius="md" p="md">
            <Group gap="sm">
              <Box p={8} style={{ background: '#ebfbee', borderRadius: 8 }}>
                <IconCash size={20} color="#2f9e44" />
              </Box>
              <Box>
                <Text size="xs" c="dimmed" fw={500}>Dana Tersalurkan</Text>
                <Text size="sm" fw={700} c="#2f9e44" lineClamp={1}>
                  {stats ? formatRupiah(stats.danaTersalurkan) : 'Rp 0'}
                </Text>
              </Box>
            </Group>
          </Card>

          <Card withBorder radius="md" p="md">
            <Group gap="sm">
              <Box p={8} style={{ background: '#fff9db', borderRadius: 8 }}>
                <IconCalendar size={20} color="#e67700" />
              </Box>
              <Box>
                <Text size="xs" c="dimmed" fw={500}>Tahun Ajaran</Text>
                <Text size="xl" fw={700} c="#e67700">{stats?.tahunAjaran ?? '-'}</Text>
              </Box>
            </Group>
          </Card>
        </SimpleGrid>
      )}

      <Divider />

      {/* ─── Form Edit ─── */}
      <Paper withBorder bg={colors['white-1']} p={{ base: 'md', md: 'lg' }} shadow="sm" radius="md">
        <Title order={5} fw={600} mb="md" c="#1A1B1E">Edit Konfigurasi</Title>

        {isLoading ? (
          <Stack gap="sm">
            <Skeleton height={56} radius="md" />
            <Skeleton height={56} radius="md" />
          </Stack>
        ) : (
          <Stack gap="md">
            <TextInput
              label="Tahun Ajaran"
              placeholder="Contoh: 2025/2026"
              value={tahunAjaran}
              onChange={(e) => setTahunAjaran(e.currentTarget.value)}
              leftSection={<IconCalendar size={16} />}
              radius="md"
              description="Format: YYYY/YYYY"
            />

            <NumberInput
              label="Dana Tersalurkan (Rp)"
              placeholder="Contoh: 1200000000"
              value={danaTersalurkan}
              onChange={(val) => setDanaTersalurkan(val)}
              leftSection={<IconCash size={16} />}
              radius="md"
              min={0}
              step={1000000}
              thousandSeparator="."
              decimalSeparator=","
              allowNegative={false}
              description="Total dana yang tersalurkan untuk tahun ajaran ini"
            />

            <Group justify="flex-end" mt="xs" gap="sm">
              <Button
                variant="default"
                radius="md"
                leftSection={<IconRefresh size={16} />}
                onClick={() => {
                  const cfg = state.beasiswaConfig.data;
                  if (cfg) {
                    setTahunAjaran(cfg.tahunAjaran);
                    setDanaTersalurkan(parseInt(cfg.danaTersalurkan, 10) || 0);
                  }
                }}
              >
                Reset
              </Button>
              <Button
                color={colors['blue-button']}
                radius="md"
                leftSection={<IconDeviceFloppy size={16} />}
                loading={isSaving}
                onClick={handleSave}
                disabled={!tahunAjaran}
              >
                Simpan Konfigurasi
              </Button>
            </Group>
          </Stack>
        )}
      </Paper>
    </Stack>
  );
}
