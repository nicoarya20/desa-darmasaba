'use client';
import { Table, Text } from '@mantine/core';
import type { Snapshot } from 'valtio';
import type { JennaProviderUsage } from '@/lib/jenna/usage-types';
import { useDarkMode } from '@/state/darkModeStore';
import { themeTokens } from '@/utils/themeTokens';
import { SectionCard } from '../../_com/SectionCard';
import { formatLatency, formatNumber } from '../../_com/format';
import { slotLabel } from './protocol';

const COLUMNS = ['Provider', 'Model', 'Giliran', 'Gagal', 'Token masuk', 'Token keluar', 'Rerata respons'] as const;

type Props = { providers: Snapshot<JennaProviderUsage[]> };

/** Pemakaian 7 hari terakhir per pasangan provider + model (terbanyak dulu). */
export function JennaUsageProviders({ providers }: Props) {
  const { isDark } = useDarkMode();
  const tokens = themeTokens(isDark);

  return (
    <SectionCard
      title="Pemakaian per provider (7 hari)"
      description="Giliran termasuk yang gagal dan yang dibatalkan pengunjung. Giliran lama tanpa catatan provider tidak ikut dihitung."
    >
      {providers.length === 0 ? (
        <Text size="sm" c={tokens.colors.text.secondary} ta="center" py="xl">
          Belum ada pemakaian dalam 7 hari terakhir.
        </Text>
      ) : (
        <Table.ScrollContainer minWidth={720}>
          <Table verticalSpacing="sm">
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
              {providers.map((p) => (
                <Table.Tr key={`${p.slot}|${p.model}`}>
                  <Table.Td style={{ whiteSpace: 'nowrap' }}>
                    <Text size="sm" fw={500}>
                      {slotLabel(p.slot)}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" ff="monospace" style={{ wordBreak: 'break-all' }}>
                      {p.model}
                    </Text>
                  </Table.Td>
                  <Table.Td>{formatNumber(p.turns)}</Table.Td>
                  <Table.Td>
                    <Text size="sm" c={p.failed > 0 ? tokens.colors.error : undefined} fw={p.failed > 0 ? 600 : undefined}>
                      {formatNumber(p.failed)}
                    </Text>
                  </Table.Td>
                  <Table.Td>{formatNumber(p.inputTokens)}</Table.Td>
                  <Table.Td>{formatNumber(p.outputTokens)}</Table.Td>
                  <Table.Td style={{ whiteSpace: 'nowrap' }}>{formatLatency(p.avgLatencyMs)}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      )}
    </SectionCard>
  );
}
