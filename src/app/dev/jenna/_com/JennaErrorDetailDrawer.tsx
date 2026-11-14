'use client';
import { Button, Drawer, Group, Stack, Text } from '@mantine/core';
import { useClipboard } from '@mantine/hooks';
import { IconCheck, IconCopy, IconMessages } from '@tabler/icons-react';
import { useSnapshot } from 'valtio';
import { useDarkMode } from '@/state/darkModeStore';
import { themeTokens } from '@/utils/themeTokens';
import jennaConversationsState from '../../_state/jenna-conversations-state';
import jennaErrorsState from '../../_state/jenna-errors-state';
import { formatDateTime, formatLatency } from '../../_com/format';
import { errorCodeLabel } from '../percakapan/percakapan.logic';
import { MetaRow } from './JennaConversationDrawer';
import { JennaErrorDetailText } from './JennaErrorDetailText';
import { slotLabel } from './protocol';

/**
 * Rincian satu giliran gagal. "Buka percakapan" membuka JennaConversationDrawer di atas drawer ini;
 * selama itu Escape hanya menutup drawer percakapan, lalu fokus kembali ke tombolnya di sini.
 */
export function JennaErrorDetailDrawer() {
  const snap = useSnapshot(jennaErrorsState);
  const { detailId: conversationId } = useSnapshot(jennaConversationsState);
  const { isDark } = useDarkMode();
  const tokens = themeTokens(isDark);
  const clipboard = useClipboard({ timeout: 2000 });
  const item = snap.selected;

  const close = () => {
    clipboard.reset();
    jennaErrorsState.closeDetail();
  };

  return (
    <Drawer
      opened={snap.detailOpen}
      onClose={close}
      position="right"
      size="lg"
      title={<Text fw={600}>Rincian giliran gagal</Text>}
      closeButtonProps={{ 'aria-label': 'Tutup rincian giliran gagal' }}
      closeOnEscape={conversationId === null}
    >
      {item && (
        <Stack gap="lg">
          <Stack gap={4}>
            <MetaRow label="Waktu" value={formatDateTime(item.createdAt)} tokens={tokens} />
            <MetaRow label="Sebab" value={errorCodeLabel(item.errorCode)} tokens={tokens} />
            <MetaRow label="Kode galat" value={item.errorCode ?? '—'} tokens={tokens} mono />
            <MetaRow label="Provider" value={item.providerSlot ? slotLabel(item.providerSlot) : '—'} tokens={tokens} />
            <MetaRow label="Model" value={item.model ?? '—'} tokens={tokens} mono />
            <MetaRow label="Lama" value={formatLatency(item.latencyMs)} tokens={tokens} />
            <MetaRow label="Kode pengunjung" value={item.session} tokens={tokens} mono />
          </Stack>

          <Stack gap={6}>
            <Text size="xs" fw={600} c={tokens.colors.text.secondary}>
              Pertanyaan (cuplikan)
            </Text>
            {/* Teks polos: isi dari pengunjung tidak pernah dirender sebagai HTML/markdown. */}
            <Text size="sm" c={tokens.colors.text.primary} style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {item.preview || '—'}
            </Text>
          </Stack>

          <Stack gap={6}>
            <Group justify="space-between" gap="sm" wrap="wrap">
              <Text size="xs" fw={600} c={tokens.colors.text.secondary}>
                Rincian galat
              </Text>
              {item.errorDetail && (
                <Button
                  size="xs"
                  variant="default"
                  leftSection={clipboard.copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                  onClick={() => item.errorDetail && clipboard.copy(item.errorDetail)}
                >
                  {clipboard.copied ? 'Tersalin' : 'Salin'}
                </Button>
              )}
            </Group>
            {item.errorDetail ? (
              <JennaErrorDetailText detail={item.errorDetail} />
            ) : (
              <Text size="sm" c={tokens.colors.text.secondary}>
                Tidak ada rincian galat yang tersimpan untuk giliran ini.
              </Text>
            )}
            {clipboard.error && (
              <Text size="xs" c={tokens.colors.error} role="alert">
                Gagal menyalin. Pilih teksnya lalu salin secara manual.
              </Text>
            )}
          </Stack>

          <Group justify="flex-end">
            <Button
              variant="light"
              leftSection={<IconMessages size={16} />}
              onClick={() => void jennaConversationsState.openDetail(item.conversationId)}
            >
              Buka percakapan
            </Button>
          </Group>
        </Stack>
      )}
    </Drawer>
  );
}
