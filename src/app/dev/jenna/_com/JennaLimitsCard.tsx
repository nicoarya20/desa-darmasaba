'use client';
import { NumberInput, SimpleGrid, TextInput } from '@mantine/core';
import { useState } from 'react';
import { useSnapshot } from 'valtio';
import { JENNA_SETTINGS_LIMITS, type JennaSettingsDTO } from '@/lib/jenna/types';
import jennaState from '../../_state/jenna-state';
import { formatNumber } from '../../_com/format';
import { SectionCard } from '../../_com/SectionCard';
import {
  LIMITS_PRESETS,
  hasErrors,
  limitsEqual,
  limitsErrors,
  limitsFromSettings,
  limitsPayload,
  type LimitsForm,
  type LimitsPreset,
} from '../jenna-form.logic';
import { useReportDirty } from './useReportDirty';

type Props = {
  settings: JennaSettingsDTO;
  /** Bawaan: Batas Pemakaian chat. */
  preset?: LimitsPreset;
};

export function JennaLimitsCard({ settings, preset = LIMITS_PRESETS.chat }: Props) {
  const snap = useSnapshot(jennaState);
  const baseline = limitsFromSettings(settings, preset);
  const [form, setForm] = useState<LimitsForm>(baseline);
  const { section } = preset;

  const dirty = !limitsEqual(form, baseline, preset);
  const errors = limitsErrors(form, preset);
  useReportDirty(section, dirty);

  const save = async () => {
    if (hasErrors(errors)) return;
    const result = await jennaState.saveSettings(section, limitsPayload(form, preset), preset.successMessage);
    if (result) setForm(limitsFromSettings(result.settings, preset));
  };

  return (
    <SectionCard
      title={preset.title}
      description={preset.description}
      save={{
        dirty,
        saving: snap.saving === section,
        blocked: hasErrors(errors) || (snap.saving !== null && snap.saving !== section),
        onSave: () => void save(),
        onReset: () => setForm(baseline),
      }}
    >
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md" verticalSpacing="md">
        {preset.fields.map(({ key, label, hint, suffix }) => {
          const { min, max } = JENNA_SETTINGS_LIMITS[key];
          return (
            <NumberInput
              key={key}
              label={label}
              description={`${hint} Rentang ${formatNumber(min)}–${formatNumber(max)}.`}
              required
              min={min}
              max={max}
              clampBehavior="none"
              allowDecimal={false}
              allowNegative={false}
              thousandSeparator="."
              decimalSeparator=","
              suffix={suffix}
              value={form[key] ?? ''}
              onChange={(value) =>
                setForm((f) => ({ ...f, [key]: typeof value === 'number' ? value : '' }))
              }
              error={errors[key]}
            />
          );
        })}
        {preset.withVoiceName && (
          <TextInput
            label="Nama suara"
            description="Kosongkan untuk memakai suara bawaan penyedia."
            placeholder="alloy"
            autoComplete="off"
            spellCheck={false}
            maxLength={JENNA_SETTINGS_LIMITS.voiceName.maxLength}
            value={form.voiceName ?? ''}
            onChange={(e) => {
              const voiceName = e.currentTarget.value;
              setForm((f) => ({ ...f, voiceName }));
            }}
            error={errors.voiceName}
          />
        )}
      </SimpleGrid>
    </SectionCard>
  );
}
