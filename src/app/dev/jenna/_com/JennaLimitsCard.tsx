'use client';
import { NumberInput, SimpleGrid } from '@mantine/core';
import { useState } from 'react';
import { useSnapshot } from 'valtio';
import { JENNA_SETTINGS_LIMITS, type JennaSettingsDTO } from '@/lib/jenna/types';
import jennaState from '../../_state/jenna-state';
import { formatNumber } from '../../_com/format';
import { SectionCard } from '../../_com/SectionCard';
import {
  LIMIT_FIELDS,
  hasErrors,
  limitsEqual,
  limitsErrors,
  limitsFromSettings,
  type LimitsForm,
} from '../jenna-form.logic';
import { useReportDirty } from './useReportDirty';

export function JennaLimitsCard({ settings }: { settings: JennaSettingsDTO }) {
  const snap = useSnapshot(jennaState);
  const baseline = limitsFromSettings(settings);
  const [form, setForm] = useState<LimitsForm>(baseline);

  const dirty = !limitsEqual(form, baseline);
  const errors = limitsErrors(form);
  useReportDirty('limits', dirty);

  const save = async () => {
    if (hasErrors(errors)) return;
    // Tidak ada galat → semua field sudah number.
    const result = await jennaState.saveSettings('limits', form as Record<keyof LimitsForm, number>, 'Batas pemakaian disimpan.');
    if (result) setForm(limitsFromSettings(result.settings));
  };

  return (
    <SectionCard
      title="Batas Pemakaian"
      description="Mencegah penyalahgunaan dan mengendalikan biaya provider."
      save={{
        dirty,
        saving: snap.saving === 'limits',
        blocked: hasErrors(errors) || (snap.saving !== null && snap.saving !== 'limits'),
        onSave: () => void save(),
        onReset: () => setForm(baseline),
      }}
    >
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md" verticalSpacing="md">
        {LIMIT_FIELDS.map(({ key, label, hint, suffix }) => {
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
              value={form[key]}
              onChange={(value) =>
                setForm((f) => ({ ...f, [key]: typeof value === 'number' ? value : '' }))
              }
              error={errors[key]}
            />
          );
        })}
      </SimpleGrid>
    </SectionCard>
  );
}
