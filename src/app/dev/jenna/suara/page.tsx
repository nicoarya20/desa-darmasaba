'use client';
import { Stack } from '@mantine/core';
import { useSnapshot } from 'valtio';
import jennaState from '../../_state/jenna-state';
import { SectionCard } from '../../_com/SectionCard';
import { JennaLimitsCard } from '../_com/JennaLimitsCard';
import { JennaProviderForm } from '../_com/JennaProviderForm';
import { JennaVoiceSwitchCard } from '../_com/JennaVoiceSwitchCard';
import { LIMITS_PRESETS } from '../jenna-form.logic';

/** Developer › Jenna › Suara. Muat config & status bersama ada di ../layout.tsx. */
export default function JennaSuaraPage() {
  const snap = useSnapshot(jennaState);
  if (!snap.config) return null;
  const { settings, voiceProvider, cryptoConfigured } = snap.config;

  // key: draf di-reset ke data server setiap load sukses.
  return (
    <Stack gap="lg" key={snap.loadVersion}>
      <JennaVoiceSwitchCard />
      <SectionCard
        title="Provider Suara"
        description="Gateway suara realtime (WebRTC). Beta; tidak pernah memakai API key provider teks."
      >
        <JennaProviderForm provider={voiceProvider} cryptoConfigured={cryptoConfigured} live={false} />
      </SectionCard>
      <JennaLimitsCard settings={settings} preset={LIMITS_PRESETS.voice} />
    </Stack>
  );
}
