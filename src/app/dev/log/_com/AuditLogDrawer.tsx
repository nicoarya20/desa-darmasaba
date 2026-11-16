'use client';
import { Badge, Code, Drawer, Stack, Text } from '@mantine/core';
import { useSnapshot } from 'valtio';
import { useDarkMode } from '@/state/darkModeStore';
import { themeTokens } from '@/utils/themeTokens';
import auditLogState from '../../_state/audit-log-state';
import { formatDateTime } from '../../_com/format';
import { MetaRow } from '../../jenna/_com/JennaConversationDrawer';
import { auditActionColor, auditActionLabel, auditTargetLabel } from '../audit-labels';
import { formatAuditMeta, roleLabel } from '../log.logic';

/** Rincian satu catatan audit (read-only), termasuk `meta` sebagai JSON terformat. */
export function AuditLogDrawer() {
  const snap = useSnapshot(auditLogState);
  const { isDark } = useDarkMode();
  const tokens = themeTokens(isDark);
  const item = snap.selectedId ? snap.data?.items.find((i) => i.id === snap.selectedId) : undefined;
  const meta = item ? formatAuditMeta(item.meta) : null;

  return (
    <Drawer
      opened={item !== undefined}
      onClose={() => auditLogState.closeDetail()}
      position="right"
      size="lg"
      title={<Text fw={600}>Rincian log audit</Text>}
      closeButtonProps={{ 'aria-label': 'Tutup rincian log audit' }}
    >
      {item && (
        <Stack gap="lg">
          <Badge
            color={auditActionColor(item.action)}
            variant="light"
            radius="sm"
            size="lg"
            style={{ textTransform: 'none', alignSelf: 'flex-start' }}
          >
            {auditActionLabel(item.action)}
          </Badge>
          <Text size="sm" c={tokens.colors.text.primary} style={{ wordBreak: 'break-word' }}>
            {item.summary}
          </Text>
          <Stack gap={4}>
            <MetaRow label="Waktu" value={formatDateTime(item.createdAt)} tokens={tokens} />
            <MetaRow label="Aktor" value={item.actorEmail ?? '—'} tokens={tokens} />
            <MetaRow label="Role aktor" value={roleLabel(item.actorRoleId)} tokens={tokens} />
            <MetaRow label="ID aktor" value={item.actorId ?? '— (akun sudah dihapus)'} tokens={tokens} mono />
            <MetaRow label="Kode aksi" value={item.action} tokens={tokens} mono />
            <MetaRow label="Target" value={auditTargetLabel(item.targetType)} tokens={tokens} />
            <MetaRow label="ID target" value={item.targetId ?? '—'} tokens={tokens} mono />
          </Stack>
          <Stack gap={6}>
            <Text size="xs" fw={600} c={tokens.colors.text.secondary}>
              Data tambahan
            </Text>
            {meta ? (
              <Code block style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {meta}
              </Code>
            ) : (
              <Text size="sm" c={tokens.colors.text.secondary}>
                Tidak ada data tambahan.
              </Text>
            )}
          </Stack>
        </Stack>
      )}
    </Drawer>
  );
}
