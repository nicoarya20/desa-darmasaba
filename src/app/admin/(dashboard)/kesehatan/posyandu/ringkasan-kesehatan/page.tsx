'use client';

import colors from '@/con/colors';
import {
  Box,
  Button,
  Card,
  Divider,
  Group,
  Loader,
  NumberInput,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import {
  IconArrowRight,
  IconMoodBoy,
  IconHeartbeat,
  IconPercentage,
  IconUser,
  IconAlertTriangle,
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useCallback } from 'react';
import { useProxy } from 'valtio/utils';
import ringkasanKesehatanState from '../../../_state/kesehatan/ringkasan-kesehatan/ringkasanKesehatan';


type StatCardProps = {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
  suffix?: string;
};

function StatCard({ label, value, icon, color = 'blue', suffix }: StatCardProps) {
  return (
    <Card withBorder radius="md" p="md">
      <Group gap="sm" align="flex-start">
        <Box
          style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            background: `var(--mantine-color-${color}-1)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: `var(--mantine-color-${color}-6)`,
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Box>
          <Text fz="xs" c="dimmed" fw={500}>{label}</Text>
          <Text fz="xl" fw={700}>
            {value}{suffix && <Text component="span" fz="sm" c="dimmed" fw={400}> {suffix}</Text>}
          </Text>
        </Box>
      </Group>
    </Card>
  );
}

export default function RingkasanKesehatanPage() {
  const router = useRouter();
  const state = useProxy(ringkasanKesehatanState);
  const stats = state.findStats.data;

  const loadStats = useCallback(() => { ringkasanKesehatanState.findStats.load(); }, []);
  useEffect(() => { loadStats(); }, [loadStats]);

  const isLoading = state.findStats.loading;

  return (
    <Box px={{ base: 0, md: 'lg' }} py="xs">
      <Title order={3} c="black" mb="md">Ringkasan Kesehatan Desa</Title>

      {isLoading ? (
        <Group justify="center" py="xl"><Loader /></Group>
      ) : (
        <Stack gap="lg">
          {/* KPI Utama */}
          <Box>
            <Text fw={600} mb="sm" c="dark">KPI Utama</Text>
            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
              <StatCard
                label="Ibu Hamil Aktif"
                value={stats?.ibuHamilAktif ?? 0}
                icon={<IconUser size={20} />}
                color="pink"
                suffix="orang"
              />
              <StatCard
                label="Balita Terdaftar"
                value={stats?.balitaTerdaftar ?? 0}
                icon={<IconMoodBoy size={20} />}
                color="blue"
                suffix="anak"
              />
              <StatCard
                label="Alert Stunting"
                value={stats?.alertStunting ?? 0}
                icon={<IconAlertTriangle size={20} />}
                color="red"
                suffix="anak"
              />
            </SimpleGrid>
          </Box>

          <Divider />

          {/* Statistik % */}
          <Box>
            <Text fw={600} mb="sm" c="dark">Statistik Kesehatan Balita</Text>
            <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
              <StatCard
                label="Imunisasi Lengkap"
                value={stats?.imunisasiLengkapPct ?? 0}
                icon={<IconHeartbeat size={20} />}
                color="teal"
                suffix="%"
              />
              <StatCard
                label="Pemeriksaan Rutin"
                value={stats?.pemeriksaanRutinPct ?? 0}
                icon={<IconHeartbeat size={20} />}
                color="green"
                suffix="%"
              />
              <StatCard
                label="Gizi Baik"
                value={stats?.giziBaikPct ?? 0}
                icon={<IconHeartbeat size={20} />}
                color="lime"
                suffix="%"
              />
              <StatCard
                label="Target Penurunan Stunting"
                value={stats?.targetStuntingPct ?? 0}
                icon={<IconPercentage size={20} />}
                color="orange"
                suffix="%"
              />
            </SimpleGrid>
          </Box>

          <Divider />

          {/* Target Stunting Config */}
          <Paper withBorder p="md" radius="md" maw={400}>
            <Text fw={600} mb="sm" c="dark">Atur Target Stunting</Text>
            <Text fz="xs" c="dimmed" mb="sm">
              Target penurunan angka stunting adalah nilai kebijakan yang ditentukan
              oleh admin, bukan turunan dari data.
            </Text>
            <Group align="flex-end" gap="sm">
              <NumberInput
                label="Target (%)"
                min={0}
                max={100}
                suffix="%"
                value={state.update.form.targetStuntingPct}
                onChange={(v) => { state.update.form.targetStuntingPct = Number(v) || 0; }}
                radius="md"
                style={{ flex: 1 }}
              />
              <Button
                onClick={() => state.update.submitTarget()}
                radius="md"
                disabled={state.update.loading}
                style={{
                  background: state.update.loading
                    ? 'linear-gradient(135deg, #ccc, #eee)'
                    : `linear-gradient(135deg, ${colors['blue-button']}, #4facfe)`,
                  color: '#fff',
                  marginBottom: 1,
                }}
              >
                {state.update.loading ? <Loader size="sm" color="white" /> : 'Simpan'}
              </Button>
            </Group>
          </Paper>

          <Divider />

          {/* Kelola Data */}
          <Box>
            <Text fw={600} mb="sm" c="dark">Kelola Data</Text>
            <Group gap="md">
              <Button
                variant="light"
                color="pink"
                radius="md"
                rightSection={<IconArrowRight size={16} />}
                onClick={() => router.push('/admin/kesehatan/posyandu/ibu-hamil')}
              >
                Kelola Ibu Hamil
              </Button>
              <Button
                variant="light"
                color="blue"
                radius="md"
                rightSection={<IconArrowRight size={16} />}
                onClick={() => router.push('/admin/kesehatan/posyandu/balita')}
              >
                Kelola Balita
              </Button>
            </Group>
          </Box>
        </Stack>
      )}
    </Box>
  );
}
