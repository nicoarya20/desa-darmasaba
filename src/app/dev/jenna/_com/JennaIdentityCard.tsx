'use client';
import { SimpleGrid, Stack, Text, TextInput, Textarea } from '@mantine/core';
import { useState } from 'react';
import { useSnapshot } from 'valtio';
import { JENNA_SETTINGS_LIMITS, type JennaSettingsDTO } from '@/lib/jenna/types';
import { useDarkMode } from '@/state/darkModeStore';
import { themeTokens } from '@/utils/themeTokens';
import jennaState from '../../_state/jenna-state';
import { SectionCard } from '../../_com/SectionCard';
import {
  hasErrors,
  identityEqual,
  identityErrors,
  identityFromSettings,
  type IdentityForm,
} from '../jenna-form.logic';
import { useReportDirty } from './useReportDirty';

const PERSONA_MAX = JENNA_SETTINGS_LIMITS.personaNote.maxLength;

export function JennaIdentityCard({ settings }: { settings: JennaSettingsDTO }) {
  const { isDark } = useDarkMode();
  const tokens = themeTokens(isDark);
  const snap = useSnapshot(jennaState);
  const baseline = identityFromSettings(settings);
  const [form, setForm] = useState<IdentityForm>(baseline);

  const dirty = !identityEqual(form, baseline);
  const errors = identityErrors(form);
  useReportDirty('identity', dirty);

  const save = async () => {
    const result = await jennaState.saveSettings(
      'identity',
      { assistantName: form.assistantName.trim(), personaNote: form.personaNote.trim() },
      'Identitas & persona disimpan.',
    );
    if (result) setForm(identityFromSettings(result.settings));
  };

  const personaLength = form.personaNote.length;

  return (
    <SectionCard
      title="Identitas & Persona"
      description="Nama dan gaya bicara Jenna saat menjawab warga."
      save={{
        dirty,
        saving: snap.saving === 'identity',
        blocked: hasErrors(errors) || (snap.saving !== null && snap.saving !== 'identity'),
        onSave: () => void save(),
        onReset: () => setForm(baseline),
      }}
    >
      <Stack gap="md">
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
          <TextInput
            label="Nama asisten"
            description="Ditampilkan di jendela chat website publik."
            required
            maxLength={JENNA_SETTINGS_LIMITS.assistantName.maxLength}
            value={form.assistantName}
            onChange={(e) => setForm((f) => ({ ...f, assistantName: e.currentTarget.value }))}
            error={errors.assistantName}
          />
        </SimpleGrid>
        <Stack gap={4}>
          <Textarea
            label="Catatan persona"
            description="Instruksi tambahan untuk gaya dan batasan jawaban, mis. 'Jawab singkat dan ramah, gunakan Bahasa Indonesia.' Boleh dikosongkan."
            autosize
            minRows={4}
            maxRows={12}
            value={form.personaNote}
            onChange={(e) => setForm((f) => ({ ...f, personaNote: e.currentTarget.value }))}
            error={errors.personaNote}
            aria-describedby="persona-counter"
          />
          <Text
            id="persona-counter"
            size="xs"
            ta="right"
            c={personaLength > PERSONA_MAX ? tokens.colors.error : tokens.colors.text.muted}
            aria-live="polite"
          >
            {personaLength}/{PERSONA_MAX} karakter
          </Text>
        </Stack>
      </Stack>
    </SectionCard>
  );
}
