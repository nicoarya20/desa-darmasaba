'use client';
import { Button, SimpleGrid, Skeleton, Stack, Text } from '@mantine/core';
import { IconCalendarWeek, IconClock, IconRefresh, IconUserCheck, IconUserOff } from '@tabler/icons-react';
import { useEffect } from 'react';
import { useSnapshot } from 'valtio';
import { UnifiedCard } from '@/components/admin/UnifiedSurface';
import { useDarkMode } from '@/state/darkModeStore';
import { themeTokens } from '@/utils/themeTokens';
import loginLogState from '../../_state/login-log-state';
import { DeveloperPageHeader } from '../../_com/DeveloperPageHeader';
import { formatNumber } from '../../_com/format';
import { StatCard } from '../../ringkasan/_com/StatCard';
import { LoginLogList } from '../_com/LoginLogList';

/** Developer › Log › Log Login (read-only). Guard role ada di ../../layout.tsx. */
export default function LogLoginPage() {
  const { loading } = useSnapshot(loginLogState);
  const { isDark } = useDarkMode();
  const tokens = themeTokens(isDark);

  useEffect(() => {
    void loginLogState.load();
  }, []);

  return (
    <>
      <DeveloperPageHeader
        title="Log Login"
        subtitle="Siapa masuk ke sistem, kapan, dan dari mana."
        action={
          <Button
            variant="default"
            leftSection={<IconRefresh size={16} />}
            onClick={() => void loginLogState.load()}
            loading={loading}
          >
            Segarkan
          </Button>
        }
      />
      <Stack gap="lg">
        <LoginStatsRow />
        <LoginLogList />
        <Text size="xs" c={tokens.colors.text.muted}>
          Disimpan 90 hari, lalu dihapus otomatis.
        </Text>
      </Stack>
    </>
  );
}

function LoginStatsRow() {
  const { data } = useSnapshot(loginLogState);

  if (!data) {
    return (
      <SimpleGrid cols={{ base: 1, xs: 2, lg: 4 }} spacing="md" aria-busy="true" aria-label="Memuat statistik login">
        {[0, 1, 2, 3].map((i) => (
          <UnifiedCard key={i} padding="lg">
            <Stack gap="sm">
              <Skeleton height={32} width={32} radius="md" />
              <Skeleton height={24} width="50%" radius="sm" />
            </Stack>
          </UnifiedCard>
        ))}
      </SimpleGrid>
    );
  }

  const { stats } = data;
  return (
    <SimpleGrid cols={{ base: 1, xs: 2, lg: 4 }} spacing="md">
      <StatCard icon={<IconClock size={20} />} title="Login 24 jam terakhir" value={formatNumber(stats.last24h)} />
      <StatCard icon={<IconCalendarWeek size={20} />} title="Login 7 hari terakhir" value={formatNumber(stats.last7d)} />
      <StatCard
        icon={<IconUserOff size={20} />}
        title="Ditolak 7 hari terakhir"
        value={formatNumber(stats.blocked7d)}
        status={stats.blocked7d > 0 ? { tone: 'error', label: 'Perlu dicek' } : undefined}
        details="Percobaan login dengan akun nonaktif."
      />
      <StatCard
        icon={<IconUserCheck size={20} />}
        title="Pengguna unik 7 hari"
        value={formatNumber(stats.uniqueUsers7d)}
      />
    </SimpleGrid>
  );
}
