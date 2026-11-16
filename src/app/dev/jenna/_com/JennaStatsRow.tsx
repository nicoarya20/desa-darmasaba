'use client';
import { Progress, SimpleGrid, Skeleton, Stack } from '@mantine/core';
import { IconAlertTriangle, IconArchive, IconCoins, IconMessageCircle } from '@tabler/icons-react';
import { useSnapshot } from 'valtio';
import { UnifiedCard } from '@/components/admin/UnifiedSurface';
import jennaConversationsState from '../../_state/jenna-conversations-state';
import { ErrorState } from '../../_com/ErrorState';
import { formatNumber } from '../../_com/format';
import { StatCard, type StatTone } from '../../ringkasan/_com/StatCard';
import { tokenBudgetUsage } from '../percakapan/percakapan.logic';

const PROGRESS_COLOR: Record<StatTone, string> = { ok: 'blue', warn: 'orange', error: 'red', neutral: 'gray' };

/** Ringkasan pemakaian Jenna hari ini (sejak 00.00 WIB) + jumlah percakapan tersimpan. */
export function JennaStatsRow() {
  const snap = useSnapshot(jennaConversationsState);
  const stats = snap.stats;

  if (!stats && snap.statsError) {
    return (
      <ErrorState
        title="Gagal memuat statistik"
        message={snap.statsError}
        onRetry={() => void jennaConversationsState.loadStats()}
        retrying={snap.statsLoading}
      />
    );
  }

  if (!stats) {
    return (
      <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }} spacing="md" aria-busy="true" aria-label="Memuat statistik">
        {[0, 1, 2, 3].map((i) => (
          <UnifiedCard key={i} padding="lg">
            <Stack gap="sm">
              <Skeleton height={14} width="60%" radius="sm" />
              <Skeleton height={24} width="40%" radius="sm" />
              <Skeleton height={10} width="80%" radius="sm" />
            </Stack>
          </UnifiedCard>
        ))}
      </SimpleGrid>
    );
  }

  const { today } = stats;
  const usage = tokenBudgetUsage(today.tokensUsed, stats.dailyTokensGlobal);

  return (
    <Stack gap="sm">
      {snap.statsError && (
        <ErrorState
          title="Gagal memuat ulang statistik"
          message={`${snap.statsError} Angka di bawah adalah versi terakhir yang berhasil dimuat.`}
          onRetry={() => void jennaConversationsState.loadStats()}
          retrying={snap.statsLoading}
        />
      )}
      <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }} spacing="md">
        <StatCard
          icon={<IconMessageCircle size={20} />}
          title="Pesan hari ini"
          value={formatNumber(today.userMessages)}
          details={`${formatNumber(today.assistantMessages)} jawaban Jenna berhasil.`}
        />
        <StatCard
          icon={<IconCoins size={20} />}
          title="Token hari ini"
          value={formatNumber(today.tokensUsed)}
          status={
            usage.tone === 'error'
              ? { tone: 'error', label: 'Kuota habis' }
              : usage.tone === 'warn'
                ? { tone: 'warn', label: 'Hampir habis' }
                : undefined
          }
          details={
            <Stack gap={6} mt={2}>
              {stats.dailyTokensGlobal > 0 && (
                <Progress
                  value={usage.percent}
                  color={PROGRESS_COLOR[usage.tone]}
                  size="sm"
                  radius="xl"
                  aria-label={`Pemakaian kuota token ${Math.floor(usage.percent)}%`}
                />
              )}
              <span>{usage.label}</span>
            </Stack>
          }
        />
        <StatCard
          icon={<IconAlertTriangle size={20} />}
          title="Galat hari ini"
          value={formatNumber(today.errorTurns)}
          status={today.errorTurns > 0 ? { tone: 'warn', label: 'Perlu dicek' } : undefined}
          details="Giliran yang gagal (waktu habis, provider, dll.)."
        />
        <StatCard
          icon={<IconArchive size={20} />}
          title="Percakapan tersimpan"
          value={formatNumber(stats.conversationsStored)}
          details={`Dihapus otomatis ${formatNumber(stats.retentionDays)} hari setelah pesan terakhir.`}
        />
      </SimpleGrid>
    </Stack>
  );
}
