'use client';
import { Badge, Box, Button, Drawer, Group, Skeleton, Stack, Text } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import { useState } from 'react';
import { useSnapshot, type Snapshot } from 'valtio';
import type { JennaConversationMessageDTO } from '@/lib/jenna/admin-types';
import { useDarkMode } from '@/state/darkModeStore';
import { themeTokens } from '@/utils/themeTokens';
import jennaConversationsState from '../../_state/jenna-conversations-state';
import jennaState from '../../_state/jenna-state';
import { ConfirmModal } from '../../_com/ConfirmModal';
import { ErrorState } from '../../_com/ErrorState';
import { formatDateTime, formatNumber } from '../../_com/format';
import { errorCodeLabel } from '../percakapan/percakapan.logic';

type Tokens = ReturnType<typeof themeTokens>;

function MessageBubble({
  message,
  assistantName,
  tokens,
}: {
  message: Snapshot<JennaConversationMessageDTO>;
  assistantName: string;
  tokens: Tokens;
}) {
  const isUser = message.role === 'user';
  const usage = message.inputTokens + message.outputTokens;

  return (
    <Stack gap={4} align={isUser ? 'flex-end' : 'flex-start'}>
      <Group gap={6} wrap="wrap" justify={isUser ? 'flex-end' : 'flex-start'}>
        <Text size="xs" fw={600} c={tokens.colors.text.secondary}>
          {isUser ? 'Pengunjung' : assistantName}
        </Text>
        <Text size="xs" c={tokens.colors.text.muted}>
          {formatDateTime(message.createdAt)}
        </Text>
        {message.status === 'error' && (
          <Badge color="red" variant="light" size="sm" title={message.errorCode ?? undefined}>
            {errorCodeLabel(message.errorCode)}
          </Badge>
        )}
      </Group>
      <Box
        px="sm"
        py={8}
        maw="85%"
        style={{
          borderRadius: 12,
          background: isUser ? tokens.colors.primaryLight : tokens.colors.bg.surface,
          border: `1px solid ${message.status === 'error' ? 'var(--mantine-color-red-4)' : tokens.colors.border.soft}`,
        }}
      >
        {/* Teks polos: isi dari pengunjung/LLM tidak pernah dirender sebagai HTML/markdown. */}
        <Text size="sm" c={tokens.colors.text.primary} style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {message.content}
        </Text>
      </Box>
      {(usage > 0 || message.toolsUsed.length > 0) && (
        <Group gap={6} wrap="wrap" justify={isUser ? 'flex-end' : 'flex-start'}>
          {usage > 0 && (
            <Text size="xs" c={tokens.colors.text.muted}>
              {formatNumber(message.inputTokens)} masuk · {formatNumber(message.outputTokens)} keluar token
            </Text>
          )}
          {message.toolsUsed.map((tool) => (
            <Badge key={tool} variant="outline" color="gray" size="xs" radius="sm" style={{ textTransform: 'none' }}>
              {tool}
            </Badge>
          ))}
        </Group>
      )}
    </Stack>
  );
}

function MetaRow({ label, value, tokens, mono }: { label: string; value: string; tokens: Tokens; mono?: boolean }) {
  return (
    <Group gap="xs" wrap="nowrap" align="baseline">
      <Text size="xs" c={tokens.colors.text.muted} w={120} style={{ flexShrink: 0 }}>
        {label}
      </Text>
      <Text size="sm" c={tokens.colors.text.primary} ff={mono ? 'monospace' : undefined}>
        {value}
      </Text>
    </Group>
  );
}

/** Detail satu percakapan (kanan) + hapus permanen. */
export function JennaConversationDrawer() {
  const snap = useSnapshot(jennaConversationsState);
  const jennaSnap = useSnapshot(jennaState);
  const { isDark } = useDarkMode();
  const tokens = themeTokens(isDark);
  const [confirming, setConfirming] = useState(false);

  const detail = snap.detail;
  const assistantName = jennaSnap.config?.settings.assistantName || 'Jenna';
  const totalTokens = detail
    ? detail.messages.reduce((sum, m) => sum + m.inputTokens + m.outputTokens, 0)
    : 0;

  const close = () => {
    setConfirming(false);
    jennaConversationsState.closeDetail();
  };

  const confirmDelete = async () => {
    if (!snap.detailId) return;
    const ok = await jennaConversationsState.deleteConversation(snap.detailId);
    if (ok) setConfirming(false);
  };

  let body: React.ReactNode;
  if (snap.detailError) {
    body = (
      <ErrorState
        title="Gagal memuat percakapan"
        message={snap.detailError}
        onRetry={() => snap.detailId && void jennaConversationsState.openDetail(snap.detailId)}
        retrying={snap.detailLoading}
      />
    );
  } else if (!detail) {
    body = (
      <Stack gap="md" aria-busy="true" aria-label="Memuat percakapan">
        <Skeleton height={72} radius="sm" />
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} height={56} width={i % 2 ? '70%' : '85%'} radius="md" ml={i % 2 ? 0 : 'auto'} />
        ))}
      </Stack>
    );
  } else {
    body = (
      <Stack gap="lg">
        <Stack gap={4}>
          <MetaRow label="Dimulai" value={formatDateTime(detail.createdAt)} tokens={tokens} />
          <MetaRow label="Aktivitas terakhir" value={formatDateTime(detail.lastMessageAt)} tokens={tokens} />
          <MetaRow label="Kode pengunjung" value={detail.session} tokens={tokens} mono />
          <MetaRow label="Kode IP" value={detail.ip} tokens={tokens} mono />
          <MetaRow label="Total token" value={formatNumber(totalTokens)} tokens={tokens} />
        </Stack>

        {detail.messages.length === 0 ? (
          <Text size="sm" c={tokens.colors.text.secondary}>
            Percakapan ini tidak punya pesan.
          </Text>
        ) : (
          <Stack gap="md">
            {detail.messages.map((m, i) => (
              <MessageBubble key={i} message={m} assistantName={assistantName} tokens={tokens} />
            ))}
          </Stack>
        )}

        <Group justify="flex-end">
          <Button color="red" variant="light" leftSection={<IconTrash size={16} />} onClick={() => setConfirming(true)}>
            Hapus percakapan
          </Button>
        </Group>
      </Stack>
    );
  }

  return (
    <>
      <Drawer
        opened={snap.detailId !== null}
        onClose={close}
        position="right"
        size="lg"
        title={<Text fw={600}>Detail percakapan</Text>}
        closeButtonProps={{ 'aria-label': 'Tutup detail percakapan' }}
      >
        {body}
      </Drawer>
      <ConfirmModal
        opened={confirming && snap.detailId !== null}
        title="Hapus percakapan?"
        message="Seluruh pesan dalam percakapan ini akan dihapus permanen dan tidak bisa dikembalikan."
        confirmLabel="Hapus permanen"
        confirmColor="red"
        loading={snap.deleting}
        onConfirm={() => void confirmDelete()}
        onClose={() => !snap.deleting && setConfirming(false)}
      />
    </>
  );
}
