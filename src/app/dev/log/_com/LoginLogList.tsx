'use client';
import { Badge, SegmentedControl, Stack, Table, Text, Tooltip } from '@mantine/core';
import { useSnapshot } from 'valtio';
import type { LoginLogResult } from '@/lib/login-log';
import { useDarkMode } from '@/state/darkModeStore';
import { themeTokens } from '@/utils/themeTokens';
import loginLogState from '../../_state/login-log-state';
import { SectionCard } from '../../_com/SectionCard';
import { LOGIN_RESULT_LABELS, deviceLabel, loginResultColor, loginResultLabel, roleLabel } from '../log.logic';
import { LogFilters } from './LogFilters';
import { LogListBody, LogPersonCell, LogTimeCell } from './LogListBody';

const COLUMNS = ['Waktu', 'Pengguna', 'Hasil', 'Alamat IP', 'Perangkat'] as const;
const ALL = 'all';
const RESULT_OPTIONS = [
  { value: ALL, label: 'Semua' },
  ...(Object.entries(LOGIN_RESULT_LABELS) as [LoginLogResult, string][]).map(([value, label]) => ({ value, label })),
];

/** Daftar Log Login (terbaru dulu) dengan filter hasil, cari email/IP, dan rentang tanggal. */
export function LoginLogList() {
  const snap = useSnapshot(loginLogState);
  const { isDark } = useDarkMode();
  const tokens = themeTokens(isDark);
  const data = snap.data;

  return (
    <SectionCard title="Riwayat login" description="Terbaru dulu. Arahkan kursor ke kolom perangkat untuk melihat User-Agent lengkap.">
      <LogFilters
        q={snap.q}
        searchPlaceholder="Email atau alamat IP"
        onSearch={(q) => loginLogState.setFilters({ q })}
        range={snap.range}
        onRange={(range) => loginLogState.setFilters({ range })}
        hasFilters={snap.result !== null || snap.q !== '' || snap.range.some((d) => d !== null)}
        onReset={() => loginLogState.resetFilters()}
      >
        <Stack gap={4} style={{ flex: '0 1 auto', maxWidth: '100%' }}>
          <Text size="sm" fw={500} component="span" id="login-log-result-label">
            Hasil
          </Text>
          <SegmentedControl
            aria-labelledby="login-log-result-label"
            data={RESULT_OPTIONS}
            value={snap.result ?? ALL}
            onChange={(value) => loginLogState.setFilters({ result: value === ALL ? null : (value as LoginLogResult) })}
            style={{ maxWidth: '100%', overflowX: 'auto' }}
          />
        </Stack>
      </LogFilters>

      <LogListBody
        noun="log login"
        list={data && { page: data.page, limit: data.limit, total: data.total, itemCount: data.items.length }}
        loading={snap.loading}
        error={snap.error}
        onRetry={() => void loginLogState.load()}
        emptyText={
          snap.result || snap.q || snap.range[0] ? 'Tidak ada login yang cocok dengan filter.' : 'Belum ada riwayat login.'
        }
        page={snap.page}
        onPage={(p) => loginLogState.setPage(p)}
      >
        <Table.ScrollContainer minWidth={820}>
          <Table verticalSpacing="sm">
            <Table.Thead>
              <Table.Tr>
                {COLUMNS.map((c) => (
                  <Table.Th key={c} style={{ whiteSpace: 'nowrap' }}>
                    {c}
                  </Table.Th>
                ))}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {data?.items.map((item) => (
                <Table.Tr key={item.id}>
                  <Table.Td>
                    <LogTimeCell iso={item.createdAt} nowIso={snap.loadedAt} />
                  </Table.Td>
                  <Table.Td style={{ maxWidth: 240 }}>
                    <LogPersonCell email={item.email} role={roleLabel(item.roleId)} />
                  </Table.Td>
                  <Table.Td>
                    <Badge
                      color={loginResultColor(item.result)}
                      variant="light"
                      radius="sm"
                      style={{ textTransform: 'none', whiteSpace: 'nowrap' }}
                    >
                      {loginResultLabel(item.result)}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" ff="monospace" style={{ wordBreak: 'break-all' }}>
                      {item.ipAddress ?? '—'}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    {item.userAgent ? (
                      <Tooltip label={item.userAgent} multiline w={320} withArrow events={{ hover: true, focus: true, touch: true }}>
                        <Text size="sm" tabIndex={0} style={{ cursor: 'help', whiteSpace: 'nowrap' }}>
                          {deviceLabel(item.userAgent)}
                        </Text>
                      </Tooltip>
                    ) : (
                      <Text size="sm" c={tokens.colors.text.muted}>
                        —
                      </Text>
                    )}
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </LogListBody>
    </SectionCard>
  );
}
