'use client';
import { Box, Button, SimpleGrid, Skeleton, Stack, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import {
  IconBrandDocker,
  IconCloudUpload,
  IconDatabase,
  IconRefresh,
  IconRobot,
  IconServer,
} from '@tabler/icons-react';
import Link from 'next/link';
import { useSnapshot, type Snapshot } from 'valtio';
import { UnifiedCard } from '@/components/admin/UnifiedSurface';
import type { ServiceStatus, SystemOverviewResponse } from '@/lib/jenna/types';
import { useDarkMode } from '@/state/darkModeStore';
import { themeTokens } from '@/utils/themeTokens';
import systemState from '../_state/system-state';
import { DeveloperPageHeader } from '../_com/DeveloperPageHeader';
import { ErrorState } from '../_com/ErrorState';
import { formatDateTime } from '../_com/format';
import { EnvChecklist } from './_com/EnvChecklist';
import { StatCard, type StatTone } from './_com/StatCard';
import { NODE_ENV_LABEL, formatUptime } from './system.logic';

/** Developer › Ringkasan Sistem. Guard role ada di ../layout.tsx. */
export default function RingkasanSistemPage() {
  const snap = useSnapshot(systemState);

  useShallowEffect(() => {
    void systemState.load();
  }, []);

  const data = snap.data;

  return (
    <Box p={{ base: 'sm', sm: 'md' }}>
      <DeveloperPageHeader
        title="Ringkasan Sistem"
        subtitle="Kondisi aplikasi dan layanan pendukung saat ini."
        action={
          <Button
            variant="default"
            leftSection={<IconRefresh size={16} />}
            onClick={() => void systemState.load()}
            loading={snap.loading}
          >
            Segarkan
          </Button>
        }
      />

      {!data && snap.error ? (
        <ErrorState
          title="Gagal memuat ringkasan sistem"
          message={snap.error}
          onRetry={() => void systemState.load()}
          retrying={snap.loading}
        />
      ) : !data ? (
        <SystemSkeleton />
      ) : (
        <Stack gap="lg">
          {snap.error && (
            <ErrorState
              title="Gagal menyegarkan"
              message={`${snap.error} Data di bawah adalah versi terakhir yang berhasil dimuat.`}
              onRetry={() => void systemState.load()}
              retrying={snap.loading}
            />
          )}
          <SystemOverview data={data} />
        </Stack>
      )}
    </Box>
  );
}

function serviceStatus(s: ServiceStatus): { tone: StatTone; label: string } {
  return s.ok ? { tone: 'ok', label: 'Normal' } : { tone: 'error', label: 'Gangguan' };
}

function serviceValue(s: ServiceStatus): string {
  return s.ok ? `${s.latencyMs} ms` : 'Tidak terhubung';
}

function SystemOverview({ data }: { data: Snapshot<SystemOverviewResponse> }) {
  const { isDark } = useDarkMode();
  const tokens = themeTokens(isDark);
  const { jenna } = data;

  const jennaStatus: { tone: StatTone; label: string } = !jenna.cryptoConfigured
    ? { tone: 'error', label: 'Kunci belum diatur' }
    : !jenna.ready
      ? { tone: 'warn', label: 'Provider belum siap' }
      : { tone: 'ok', label: 'Siap' };

  return (
    <Stack gap="lg">
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md" verticalSpacing="md">
        <StatCard
          icon={<IconBrandDocker size={20} />}
          title="Versi aplikasi"
          value={`v${data.version}`}
          details={`Lingkungan: ${NODE_ENV_LABEL[data.nodeEnv] ?? data.nodeEnv}`}
        />
        <StatCard
          icon={<IconServer size={20} />}
          title="Uptime server"
          value={formatUptime(data.uptimeSec)}
          details={`Diperiksa ${formatDateTime(data.generatedAt)}`}
        />
        <StatCard
          icon={<IconDatabase size={20} />}
          title="Database (PostgreSQL)"
          value={serviceValue(data.database)}
          status={serviceStatus(data.database)}
          details={data.database.error ?? 'Latensi query sederhana.'}
        />
        <StatCard
          icon={<IconCloudUpload size={20} />}
          title="Penyimpanan file (MinIO)"
          value={serviceValue(data.minio)}
          status={serviceStatus(data.minio)}
          details={data.minio.error ?? `Bucket: ${data.minio.bucket}`}
        />
        <StatCard
          icon={<IconRobot size={20} />}
          title="Asisten Jenna"
          value={jenna.enabled ? 'Aktif' : 'Nonaktif'}
          status={jennaStatus}
          details={
            <Link href="/dev/jenna" style={{ color: tokens.colors.text.link }}>
              Buka Pengaturan Jenna
            </Link>
          }
        />
      </SimpleGrid>

      <EnvChecklist env={data.env} />

      <Text size="xs" c={tokens.colors.text.muted}>
        Data diambil langsung dari server saat halaman dimuat atau disegarkan.
      </Text>
    </Stack>
  );
}

function SystemSkeleton() {
  return (
    <Stack gap="lg" aria-busy="true" aria-label="Memuat ringkasan sistem">
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md" verticalSpacing="md">
        {Array.from({ length: 5 }, (_, i) => (
          <UnifiedCard key={i} padding="lg">
            <Stack gap="sm">
              <Skeleton height={32} width={32} radius="md" />
              <Skeleton height={24} width="60%" radius="sm" />
              <Skeleton height={12} width="80%" radius="sm" />
            </Stack>
          </UnifiedCard>
        ))}
      </SimpleGrid>
      <UnifiedCard padding="lg">
        <Skeleton height={160} radius="md" />
      </UnifiedCard>
    </Stack>
  );
}
