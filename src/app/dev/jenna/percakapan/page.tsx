'use client';
import { Stack } from '@mantine/core';
import { useEffect } from 'react';
import { useSnapshot } from 'valtio';
import jennaConversationsState from '../../_state/jenna-conversations-state';
import jennaState from '../../_state/jenna-state';
import { JennaConversationDrawer } from '../_com/JennaConversationDrawer';
import { JennaConversationList } from '../_com/JennaConversationList';
import { JennaStatsRow } from '../_com/JennaStatsRow';

/** Developer › Jenna › Percakapan. "Muat ulang" di ../layout.tsx menaikkan loadVersion → data dimuat ulang. */
export default function JennaPercakapanPage() {
  const { loadVersion } = useSnapshot(jennaState);

  useEffect(() => {
    jennaConversationsState.refresh();
  }, [loadVersion]);

  useEffect(() => () => jennaConversationsState.closeDetail(), []);

  return (
    <Stack gap="lg">
      <JennaStatsRow />
      <JennaConversationList />
      <JennaConversationDrawer />
    </Stack>
  );
}
