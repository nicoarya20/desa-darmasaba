'use client';
import { Anchor, Badge, Group, Table, Text } from '@mantine/core';
import { IconExternalLink } from '@tabler/icons-react';
import type { Snapshot } from 'valtio';
import type { JennaKnowledgeSourceDTO } from '@/lib/jenna/knowledge-types';
import { useDarkMode } from '@/state/darkModeStore';
import { themeTokens } from '@/utils/themeTokens';
import { SectionCard } from '../../_com/SectionCard';
import { formatNumber } from '../../_com/format';
import { TIER_META, groupSourcesByTier, sourcesSummary } from '../pengetahuan/pengetahuan.logic';

const COLUMNS = ['Sumber', 'Domain', 'Baris / batas', 'Halaman publik'] as const;

type Props = { sources: Snapshot<JennaKnowledgeSourceDTO[]> };

/** Sumber data yang boleh dibaca Jenna (allowlist), dikelompokkan per tier. Read-only. */
export function JennaKnowledgeSources({ sources }: Props) {
  const { isDark } = useDarkMode();
  const tokens = themeTokens(isDark);
  const summary = sourcesSummary(sources);
  const groups = groupSourcesByTier(sources);

  return (
    <SectionCard
      title="Sumber Data"
      description="Data website publik yang boleh dibaca Jenna. Sumber yang menunya disembunyikan di website publik tidak dibaca sama sekali."
      aside={
        summary.total > 0 ? (
          <Text size="xs" c={tokens.colors.text.muted}>
            {formatNumber(summary.visible)} dari {formatNumber(summary.total)} sumber dibaca ·{' '}
            {formatNumber(summary.rows)} baris
          </Text>
        ) : undefined
      }
    >
      {groups.length === 0 ? (
        <Text size="sm" c={tokens.colors.text.secondary} ta="center" py="xl">
          Belum ada sumber data terdaftar.
        </Text>
      ) : (
        <Table.ScrollContainer minWidth={640}>
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
            {groups.map(({ tier, sources: rows }) => (
              <Table.Tbody key={tier}>
                <Table.Tr>
                  <Table.Th colSpan={COLUMNS.length} scope="colgroup" style={{ background: tokens.colors.bg.surface }}>
                    <Text size="sm" fw={600} c={tokens.colors.text.primary}>
                      Tier {tier} · {TIER_META[tier].label}
                    </Text>
                    <Text size="xs" fw={400} c={tokens.colors.text.muted}>
                      {TIER_META[tier].hint}
                    </Text>
                  </Table.Th>
                </Table.Tr>
                {rows.map((source) => (
                  <Table.Tr key={source.key}>
                    <Table.Td>
                      <Group gap={6} wrap="wrap">
                        <Text size="sm" c={source.visible ? tokens.colors.text.primary : tokens.colors.text.muted}>
                          {source.label}
                        </Text>
                        {!source.visible && (
                          <Badge color="gray" variant="light" size="sm" title="Menu sumber ini disembunyikan di website publik">
                            Disembunyikan
                          </Badge>
                        )}
                        {source.searchable && (
                          <Badge color="blue" variant="light" size="sm" title="Bisa dicari Jenna lewat tool cari_konten">
                            Dicari saat perlu
                          </Badge>
                        )}
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Text size="xs" ff="monospace" c={tokens.colors.text.secondary}>
                        {source.domain}
                      </Text>
                    </Table.Td>
                    <Table.Td style={{ whiteSpace: 'nowrap' }}>
                      <Text size="sm" c={tokens.colors.text.primary}>
                        {formatNumber(source.rows)} / {formatNumber(source.take)}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Anchor
                        href={source.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        size="sm"
                        aria-label={`Buka halaman publik ${source.label} di tab baru`}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 4, wordBreak: 'break-all' }}
                      >
                        {source.href}
                        <IconExternalLink size={14} aria-hidden style={{ flexShrink: 0 }} />
                      </Anchor>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            ))}
          </Table>
        </Table.ScrollContainer>
      )}
    </SectionCard>
  );
}
