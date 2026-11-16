'use client';
import { Badge, Select, Table, Text, UnstyledButton } from '@mantine/core';
import { useSnapshot } from 'valtio';
import { useDarkMode } from '@/state/darkModeStore';
import { themeTokens } from '@/utils/themeTokens';
import auditLogState from '../../_state/audit-log-state';
import { SectionCard } from '../../_com/SectionCard';
import { formatDateTime, formatNumber } from '../../_com/format';
import { AUDIT_ACTION_OPTIONS, auditActionColor, auditActionLabel, auditTargetLabel } from '../audit-labels';
import { roleLabel } from '../log.logic';
import { LogFilters } from './LogFilters';
import { LogListBody, LogPersonCell, LogTimeCell } from './LogListBody';

const COLUMNS = ['Waktu', 'Aktor', 'Aksi', 'Ringkasan', 'Target'] as const;

/** Daftar Log Audit (terbaru dulu) dengan filter aksi, cari, dan rentang tanggal. */
export function AuditLogList() {
  const snap = useSnapshot(auditLogState);
  const { isDark } = useDarkMode();
  const tokens = themeTokens(isDark);
  const data = snap.data;

  const counts = new Map(data?.facets.actions.map((f) => [f.action, f.count]));
  const actionOptions = [
    // Aksi yang hanya ada di data lama tetap bisa dipilih.
    ...new Set<string>([...AUDIT_ACTION_OPTIONS, ...counts.keys()]),
  ].map((action) => ({
    value: action,
    label: counts.has(action) ? `${auditActionLabel(action)} (${formatNumber(counts.get(action)!)})` : auditActionLabel(action),
  }));

  return (
    <SectionCard title="Riwayat perubahan" description="Terbaru dulu. Klik baris untuk melihat rincian.">
      <LogFilters
        q={snap.q}
        searchPlaceholder="Ringkasan, email aktor, atau ID target"
        onSearch={(q) => auditLogState.setFilters({ q })}
        range={snap.range}
        onRange={(range) => auditLogState.setFilters({ range })}
        hasFilters={snap.action !== null || snap.q !== '' || snap.range.some((d) => d !== null)}
        onReset={() => auditLogState.resetFilters()}
      >
        <Select
          label="Aksi"
          placeholder="Semua aksi"
          data={actionOptions}
          value={snap.action}
          onChange={(action) => auditLogState.setFilters({ action })}
          clearable
          searchable
          nothingFoundMessage="Aksi tidak ditemukan"
          style={{ flex: '1 1 240px' }}
        />
      </LogFilters>

      <LogListBody
        noun="log audit"
        list={data && { page: data.page, limit: data.limit, total: data.total, itemCount: data.items.length }}
        loading={snap.loading}
        error={snap.error}
        onRetry={() => void auditLogState.load()}
        emptyText={
          snap.action || snap.q || snap.range[0] ? 'Tidak ada catatan yang cocok dengan filter.' : 'Belum ada catatan audit.'
        }
        page={snap.page}
        onPage={(p) => auditLogState.setPage(p)}
      >
        <Table.ScrollContainer minWidth={860}>
          <Table highlightOnHover verticalSpacing="sm">
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
                <Table.Tr key={item.id} style={{ cursor: 'pointer' }} onClick={() => auditLogState.openDetail(item.id)}>
                  <Table.Td>
                    <LogTimeCell iso={item.createdAt} nowIso={snap.loadedAt} />
                  </Table.Td>
                  <Table.Td style={{ maxWidth: 220 }}>
                    <LogPersonCell email={item.actorEmail} role={roleLabel(item.actorRoleId)} />
                  </Table.Td>
                  <Table.Td>
                    <Badge color={auditActionColor(item.action)} variant="light" radius="sm" style={{ textTransform: 'none' }}>
                      {auditActionLabel(item.action)}
                    </Badge>
                  </Table.Td>
                  <Table.Td style={{ maxWidth: 360 }}>
                    <UnstyledButton
                      onClick={(e) => {
                        e.stopPropagation();
                        auditLogState.openDetail(item.id);
                      }}
                      aria-label={`Buka rincian: ${item.summary} (${formatDateTime(item.createdAt)})`}
                      style={{ textAlign: 'left', width: '100%' }}
                    >
                      <Text size="sm" lineClamp={2} c={tokens.colors.text.primary} style={{ wordBreak: 'break-word' }}>
                        {item.summary}
                      </Text>
                    </UnstyledButton>
                  </Table.Td>
                  <Table.Td style={{ maxWidth: 200 }}>
                    <Text size="sm">{auditTargetLabel(item.targetType)}</Text>
                    {item.targetId && (
                      <Text size="xs" c={tokens.colors.text.muted} ff="monospace" style={{ wordBreak: 'break-all' }}>
                        {item.targetId}
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
