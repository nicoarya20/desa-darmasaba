'use client';
import { Stack, Text } from '@mantine/core';
import { useEffect } from 'react';
import { useSnapshot } from 'valtio';
import { useDarkMode } from '@/state/darkModeStore';
import { themeTokens } from '@/utils/themeTokens';
import jennaConversationsState from '../../_state/jenna-conversations-state';
import jennaErrorsState from '../../_state/jenna-errors-state';
import jennaState from '../../_state/jenna-state';
import { JennaConversationDrawer } from '../_com/JennaConversationDrawer';
import { JennaErrorDetailDrawer } from '../_com/JennaErrorDetailDrawer';
import { JennaErrorLogList } from '../_com/JennaErrorLogList';

const closeDrawers = () => {
  jennaErrorsState.closeDetail();
  jennaConversationsState.closeDetail();
};

// Giliran gagal ikut terhapus bersama percakapannya: tutup rinciannya dan muat ulang daftar.
const afterConversationDeleted = () => {
  jennaErrorsState.closeDetail();
  void jennaErrorsState.load();
};

/** Developer › Jenna › Log Error (read-only). "Muat ulang" di ../layout.tsx menaikkan loadVersion → data dimuat ulang. */
export default function JennaLogErrorPage() {
  const { loadVersion } = useSnapshot(jennaState);
  const { isDark } = useDarkMode();
  const tokens = themeTokens(isDark);

  useEffect(() => {
    void jennaErrorsState.load();
  }, [loadVersion]);

  useEffect(() => closeDrawers, []);

  return (
    <Stack gap="lg">
      <Text size="sm" c={tokens.colors.text.secondary}>
        Giliran yang dibatalkan pengunjung (menekan Berhenti) tidak dicatat di sini.
      </Text>
      <JennaErrorLogList />
      <JennaErrorDetailDrawer />
      {/* Setelah drawer rincian supaya detail percakapan tampil di atasnya. */}
      <JennaConversationDrawer onDeleted={afterConversationDeleted} />
    </Stack>
  );
}
