'use client';
import { Badge, Box, Button, Group, SegmentedControl, Skeleton, Stack, Table, Text, UnstyledButton } from '@mantine/core';
import { useSnapshot, type Snapshot } from 'valtio';
import type { JennaErrorLogItem } from '@/lib/jenna/usage-types';
import { useDarkMode } from '@/state/darkModeStore';
import { themeTokens } from '@/utils/themeTokens';
import jennaErrorsState from '../../_state/jenna-errors-state';
import { ErrorState } from '../../_com/ErrorState';
import { SectionCard } from '../../_com/SectionCard';
import { formatDateTime, formatLatency, formatNumber } from '../../_com/format';
import { ERROR_LOG_RANGES, parseErrorLogDays } from '../log-error/log-error.logic';
import { errorCodeLabel } from '../percakapan/percakapan.logic';
import { providerLabel } from './protocol';

const COLUMNS = ['Waktu', 'Sebab', 'Provider', 'Pertanyaan', 'Lama'] as const;
const RANGE_OPTIONS = ERROR_LOG_RANGES.map((range) => ({ value: String(range.days), label: range.label }));

type Item = Snapshot<JennaErrorLogItem>;

function CauseBadge({ item }: { item: Item }) {
  return (
    <Badge color="red" variant="light" size="sm" title={item.errorCode ?? undefined}>
      {errorCodeLabel(item.errorCode)}
    </Badge>
  );
}

/** Daftar giliran gagal (terbaru dulu): tabel di layar lebar, kartu bertumpuk di bawah 48em. */
export function JennaErrorLogList() {
  const { log } = useSnapshot(jennaErrorsState);
  const { isDark } = useDarkMode();
  const tokens = themeTokens(isDark);
  const items = log.items;

  const rangeControl = (
    <SegmentedControl
      aria-label="Rentang waktu log error"
      size="xs"
      data={RANGE_OPTIONS}
      value={String(log.days)}
      onChange={(value) => {
        const days = parseErrorLogDays(value);
        if (days !== null) jennaErrorsState.setDays(days);
      }}
    />
  );

  let body: React.ReactNode;
  if (!items && log.error) {
    body = (
      <ErrorState
        title="Gagal memuat log error"
        message={log.error}
        onRetry={() => void jennaErrorsState.load()}
        retrying={log.loading}
      />
    );
  } else if (!items) {
    body = (
      <div aria-busy="true" aria-label="Memuat log error">
        {[0, 1, 2, 3, 4].map((i) => (
          <Skeleton key={i} height={44} radius="sm" mb="xs" />
        ))}
      </div>
    );
  } else {
    body = (
      <>
        {log.error && (
          <ErrorState
            title="Gagal memuat ulang log error"
            message={`${log.error} Daftar di bawah adalah versi terakhir yang berhasil dimuat.`}
            onRetry={() => void jennaErrorsState.load()}
            retrying={log.loading}
          />
        )}
        {items.length === 0 ? (
          <Text size="sm" c={tokens.colors.text.secondary} ta="center" py="xl">
            Tidak ada giliran gagal dalam rentang ini.
          </Text>
        ) : (
          <Box style={{ opacity: log.loading ? 0.6 : 1 }}>
            <Box visibleFrom="sm">
              <Table.ScrollContainer minWidth={680}>
                <Table highlightOnHover verticalSpacing="sm">
                  <Table.Thead>
                    <Table.Tr>
                      {COLUMNS.map((column) => (
                        <Table.Th key={column} style={{ whiteSpace: 'nowrap' }}>
                          {column}
                        </Table.Th>
                      ))}
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {items.map((item) => (
                      <Table.Tr
                        key={item.id}
                        style={{ cursor: 'pointer' }}
                        onClick={() => jennaErrorsState.openDetail(item)}
                      >
                        <Table.Td style={{ whiteSpace: 'nowrap' }}>
                          <Text size="sm">{formatDateTime(item.createdAt)}</Text>
                        </Table.Td>
                        <Table.Td>
                          <CauseBadge item={item} />
                        </Table.Td>
                        <Table.Td style={{ maxWidth: 220 }}>
                          <Text size="sm" style={{ wordBreak: 'break-word' }}>
                            {providerLabel(item.providerSlot, item.model)}
                          </Text>
                        </Table.Td>
                        <Table.Td style={{ maxWidth: 320 }}>
                          <UnstyledButton
                            onClick={(e) => {
                              e.stopPropagation();
                              jennaErrorsState.openDetail(item);
                            }}
                            aria-label={`Buka rincian giliran gagal ${formatDateTime(item.createdAt)}`}
                            style={{ textAlign: 'left', width: '100%' }}
                          >
                            <Text size="sm" lineClamp={2} c={tokens.colors.text.primary} style={{ wordBreak: 'break-word' }}>
                              {item.preview || '—'}
                            </Text>
                          </UnstyledButton>
                        </Table.Td>
                        <Table.Td style={{ whiteSpace: 'nowrap' }}>
                          <Text size="sm">{formatLatency(item.latencyMs)}</Text>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            </Box>

            <Stack component="ul" gap="sm" m={0} p={0} hiddenFrom="sm" style={{ listStyle: 'none' }}>
              {items.map((item) => (
                <Box component="li" key={item.id}>
                  <UnstyledButton
                    onClick={() => jennaErrorsState.openDetail(item)}
                    p="sm"
                    style={{
                      display: 'block',
                      width: '100%',
                      border: `1px solid ${tokens.colors.border.soft}`,
                      borderRadius: 8,
                    }}
                  >
                    <Group justify="space-between" gap="xs" wrap="wrap" mb={6}>
                      <Text size="xs" c={tokens.colors.text.muted}>
                        {formatDateTime(item.createdAt)}
                      </Text>
                      <CauseBadge item={item} />
                    </Group>
                    <Text size="sm" lineClamp={2} c={tokens.colors.text.primary} style={{ wordBreak: 'break-word' }}>
                      {item.preview || '—'}
                    </Text>
                    <Text size="xs" c={tokens.colors.text.muted} mt={6} style={{ wordBreak: 'break-word' }}>
                      Provider: {providerLabel(item.providerSlot, item.model)} · Lama: {formatLatency(item.latencyMs)}
                    </Text>
                  </UnstyledButton>
                </Box>
              ))}
            </Stack>
          </Box>
        )}
        {items.length > 0 && (
          <Stack gap="xs" align="center">
            <Text size="sm" c={tokens.colors.text.secondary}>
              {formatNumber(items.length)} giliran gagal ditampilkan{log.nextCursor === null ? ' (semua)' : ''}.
            </Text>
            {log.moreError && (
              <Text size="sm" c={tokens.colors.error} role="alert" ta="center">
                {log.moreError} Tekan &quot;Muat lebih banyak&quot; untuk mencoba lagi.
              </Text>
            )}
            {log.nextCursor !== null && (
              <Button
                variant="default"
                onClick={() => void jennaErrorsState.loadMore()}
                loading={log.loadingMore}
                disabled={log.loading}
              >
                Muat lebih banyak
              </Button>
            )}
          </Stack>
        )}
      </>
    );
  }

  return (
    <SectionCard
      title="Giliran gagal"
      description="Terbaru dulu. Klik satu giliran untuk membaca rincian galatnya."
      aside={rangeControl}
    >
      {body}
    </SectionCard>
  );
}
