'use client';
import { Stack } from '@mantine/core';
import { useSnapshot } from 'valtio';
import jennaState from '../_state/jenna-state';
import { JennaIdentityCard } from './_com/JennaIdentityCard';
import { JennaStatusCard } from './_com/JennaStatusCard';

/** Developer › Jenna › Umum. Muat config & status bersama ada di ./layout.tsx. */
export default function JennaUmumPage() {
  const snap = useSnapshot(jennaState);
  if (!snap.config) return null;

  // key: draf di-reset ke data server setiap load sukses.
  return (
    <Stack gap="lg" key={snap.loadVersion}>
      <JennaStatusCard />
      <JennaIdentityCard settings={snap.config.settings} />
    </Stack>
  );
}
