'use client';
import {
  Accordion,
  Alert,
  Autocomplete,
  Button,
  Group,
  NumberInput,
  PasswordInput,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { IconKey, IconPlugConnected } from '@tabler/icons-react';
import { useId, useState } from 'react';
import { useSnapshot } from 'valtio';
import { describeReasoning, resolveReasoningEffort } from '@/lib/jenna/reasoning';
import { JENNA_PROVIDER_LIMITS, JENNA_REASONING_EFFORTS } from '@/lib/jenna/types';
import { isJennaReasoningEffort } from '@/lib/jenna/validation';
import { useDarkMode } from '@/state/darkModeStore';
import { themeTokens } from '@/utils/themeTokens';
import jennaState from '../../_state/jenna-state';
import { ConfirmModal } from '../../_com/ConfirmModal';
import { formatDateTime } from '../../_com/format';
import { SaveActions } from '../../_com/SectionCard';
import {
  TIMEOUT_SEC_RANGE,
  hasAdvancedError,
  hasCustomAdvanced,
  hasErrors,
  isVoiceProvider,
  modelSuggestions,
  providerCopy,
  providerEqual,
  providerErrors,
  providerFormFrom,
  providerPayload,
  providerStatus,
  saveRunsTest,
  voiceProviderPayload,
  type AnyProviderDTO,
  type NumberField,
  type ProviderForm,
} from '../jenna-form.logic';
import { JennaProviderKeyDelete } from './JennaProviderKeyDelete';
import { JennaProviderStatus } from './JennaProviderStatus';
import { providerName } from './protocol';
import { useReportDirty } from './useReportDirty';

type Props = {
  /** Provider suara (slot "voice"): tanpa temperature & max tokens. */
  provider: AnyProviderDTO;
  /** Slot ini dipakai chat publik saat ini (protokol aktif & Jenna aktif). */
  live: boolean;
  cryptoConfigured: boolean;
};

const toNumberField = (value: number | string): NumberField => (typeof value === 'number' ? value : '');

// Nilai opsi Select tidak boleh kosong; '' (Otomatis) di form dipetakan ke sentinel ini.
const REASONING_EFFORT_AUTO = 'auto';
const REASONING_EFFORT_OPTIONS = [
  { value: REASONING_EFFORT_AUTO, label: 'Otomatis (disarankan)' },
  ...JENNA_REASONING_EFFORTS.map((value) => ({ value, label: value === 'off' ? 'Jangan kirim' : value })),
];
const ADVANCED_PANEL = 'advanced';

export function JennaProviderForm({ provider, live, cryptoConfigured }: Props) {
  const { isDark } = useDarkMode();
  const tokens = themeTokens(isDark);
  const snap = useSnapshot(jennaState);
  const testHintId = useId();
  const baseline = providerFormFrom(provider);
  const [form, setForm] = useState<ProviderForm>(baseline);
  const [replacingKey, setReplacingKey] = useState(!provider.hasApiKey);
  const [confirmLive, setConfirmLive] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(() => hasCustomAdvanced(baseline));

  const { slot } = provider;
  const voice = isVoiceProvider(provider);
  const copy = providerCopy(provider);
  const dirty = !providerEqual(form, baseline);
  const errors = providerErrors(form, voice);
  const saving = snap.saving === slot;
  const testing = snap.testingSlot === slot;
  const openai = !isVoiceProvider(provider) && provider.protocol === 'openai';
  const reasoningSent = openai && resolveReasoningEffort(form.model, form.reasoningEffort) !== null;
  const suggestions = modelSuggestions(provider);
  const runsTest = saveRunsTest(form, provider, cryptoConfigured);
  const saveLabel = runsTest ? 'Simpan & tes' : 'Simpan';
  useReportDirty(slot, dirty);

  const set = <K extends keyof ProviderForm>(key: K, value: ProviderForm[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const reset = () => {
    setForm(baseline);
    setReplacingKey(!provider.hasApiKey);
  };

  const runTest = () =>
    void (isVoiceProvider(provider) ? jennaState.testVoiceProvider() : jennaState.testProvider(provider.slot));

  const save = async () => {
    const result = isVoiceProvider(provider)
      ? await jennaState.saveVoiceProvider(voiceProviderPayload(form))
      : await jennaState.saveProvider(provider.slot, providerPayload(form));
    setConfirmLive(false);
    const saved = voice ? result?.voiceProvider : result?.providers.find((p) => p.slot === slot);
    if (!saved) return;
    setForm(providerFormFrom(saved));
    setReplacingKey(!saved.hasApiKey);
    if (saved.ready && cryptoConfigured) runTest();
  };

  const testDisabledReason = !cryptoConfigured
    ? 'Kunci enkripsi server belum diatur.'
    : dirty
      ? 'Simpan perubahan dulu sebelum menguji koneksi.'
      : !provider.ready
        ? 'Lengkapi Base URL, model, dan API key lalu simpan.'
        : null;

  const modelHint = (value: string) => suggestions.find((s) => s.value === value)?.hint;
  const modelProps = {
    label: copy.modelLabel,
    description: copy.modelDescription,
    placeholder: copy.modelPlaceholder,
    required: true,
    autoComplete: 'off',
    spellCheck: false,
    maxLength: JENNA_PROVIDER_LIMITS.model.maxLength,
    error: dirty ? errors.model : undefined,
  };

  return (
    <Stack gap="md" pt="md">
      <JennaProviderStatus
        status={providerStatus(provider, testing)}
        note={provider.updatedAt ? `Disimpan ${formatDateTime(provider.updatedAt)}` : undefined}
      />

      {!cryptoConfigured ? (
        <Alert color="orange" variant="light" icon={<IconKey size={16} />} title="API key tidak dapat disimpan">
          Kunci enkripsi server (JENNA_CREDENTIALS_KEY) belum diatur. Base URL dan model tetap bisa disimpan.
        </Alert>
      ) : (
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
          {replacingKey ? (
            <Stack gap={4}>
              <PasswordInput
                label="API key"
                description={
                  provider.hasApiKey
                    ? 'Masukkan kunci baru. Kosongkan untuk tetap memakai kunci lama.'
                    : 'Disimpan terenkripsi di server dan tidak pernah ditampilkan ulang.'
                }
                placeholder={provider.hasApiKey ? 'Kunci baru' : 'sk-…'}
                autoComplete="new-password"
                spellCheck={false}
                maxLength={JENNA_PROVIDER_LIMITS.apiKey.maxLength}
                value={form.apiKey}
                onChange={(e) => set('apiKey', e.currentTarget.value)}
                error={errors.apiKey}
              />
              {provider.hasApiKey && (
                <Group justify="flex-end">
                  <Button
                    variant="subtle"
                    size="xs"
                    onClick={() => {
                      set('apiKey', '');
                      setReplacingKey(false);
                    }}
                  >
                    Batal ganti kunci
                  </Button>
                </Group>
              )}
            </Stack>
          ) : (
            <Group gap="sm" align="flex-end" wrap="wrap">
              <TextInput
                label="API key"
                description="Tersimpan terenkripsi."
                readOnly
                value={`••••${provider.apiKeyHint ?? ''}`}
                style={{ flex: '1 1 220px' }}
                aria-label="API key tersimpan (disamarkan)"
              />
              <Button variant="light" leftSection={<IconKey size={16} />} onClick={() => setReplacingKey(true)}>
                Ganti kunci
              </Button>
              <JennaProviderKeyDelete
                provider={provider}
                live={live}
                disabled={snap.saving !== null || testing}
                onCleared={() => {
                  set('apiKey', '');
                  setReplacingKey(true);
                }}
              />
            </Group>
          )}
        </SimpleGrid>
      )}

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        <Stack gap={4}>
          {suggestions.length > 0 ? (
            <Autocomplete
              {...modelProps}
              data={suggestions.map((s) => s.value)}
              renderOption={({ option }) => {
                const hint = modelHint(option.value);
                return (
                  <Group gap="xs" wrap="nowrap" justify="space-between" w="100%">
                    <Text size="sm">{option.value}</Text>
                    {hint && (
                      <Text size="xs" c={tokens.colors.text.muted}>
                        {hint}
                      </Text>
                    )}
                  </Group>
                );
              }}
              value={form.model}
              onChange={(value) => set('model', value)}
            />
          ) : (
            <TextInput {...modelProps} value={form.model} onChange={(e) => set('model', e.currentTarget.value)} />
          )}
          {openai && (
            <Text size="xs" c={tokens.colors.text.muted}>
              {describeReasoning(form.model, form.reasoningEffort)}
            </Text>
          )}
        </Stack>
        <TextInput
          label="Base URL"
          description={copy.baseUrlDescription}
          placeholder={copy.baseUrlPlaceholder}
          required
          type="url"
          inputMode="url"
          autoComplete="off"
          spellCheck={false}
          maxLength={JENNA_PROVIDER_LIMITS.baseUrl.maxLength}
          value={form.baseUrl}
          onChange={(e) => set('baseUrl', e.currentTarget.value)}
          error={dirty ? errors.baseUrl : undefined}
        />
      </SimpleGrid>

      <Accordion
        variant="contained"
        chevronSize={14}
        value={advancedOpen || hasAdvancedError(errors) ? ADVANCED_PANEL : null}
        onChange={(value) => setAdvancedOpen(value === ADVANCED_PANEL)}
      >
        <Accordion.Item value={ADVANCED_PANEL}>
          <Accordion.Control>
            <Text fw={500} fz="sm">
              Pengaturan lanjutan
            </Text>
          </Accordion.Control>
          <Accordion.Panel>
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              {!voice && (
                <>
                  <NumberInput
                    label="Temperature"
                    description={
                      reasoningSent
                        ? 'Diabaikan untuk model reasoning (nilai tetap disimpan).'
                        : `${JENNA_PROVIDER_LIMITS.temperature.min}–${JENNA_PROVIDER_LIMITS.temperature.max}. Kosongkan = default provider.`
                    }
                    min={JENNA_PROVIDER_LIMITS.temperature.min}
                    max={JENNA_PROVIDER_LIMITS.temperature.max}
                    step={0.1}
                    decimalScale={2}
                    decimalSeparator=","
                    allowNegative={false}
                    clampBehavior="none"
                    value={form.temperature}
                    onChange={(v) => set('temperature', toNumberField(v))}
                    error={errors.temperature}
                  />
                  <NumberInput
                    label="Max tokens"
                    description="Batas panjang jawaban. Kosongkan = default provider."
                    min={JENNA_PROVIDER_LIMITS.maxTokens.min}
                    max={JENNA_PROVIDER_LIMITS.maxTokens.max}
                    allowDecimal={false}
                    allowNegative={false}
                    thousandSeparator="."
                    decimalSeparator=","
                    clampBehavior="none"
                    value={form.maxTokens}
                    onChange={(v) => set('maxTokens', toNumberField(v))}
                    error={errors.maxTokens}
                  />
                </>
              )}
              <NumberInput
                label="Timeout"
                description={`${TIMEOUT_SEC_RANGE.min}–${TIMEOUT_SEC_RANGE.max} detik.`}
                required
                min={TIMEOUT_SEC_RANGE.min}
                max={TIMEOUT_SEC_RANGE.max}
                decimalScale={1}
                decimalSeparator=","
                allowNegative={false}
                clampBehavior="none"
                suffix=" detik"
                value={form.timeoutSec}
                onChange={(v) => set('timeoutSec', toNumberField(v))}
                error={errors.timeoutSec}
              />
              {openai && (
                <Select
                  label="Reasoning effort"
                  description="Otomatis menyesuaikan nama model. Pilih manual hanya bila provider menolak setelan otomatis (cek dengan Tes koneksi). Bila dikirim, batas token memakai max_completion_tokens dan temperature tidak dikirim."
                  data={REASONING_EFFORT_OPTIONS}
                  allowDeselect={false}
                  value={form.reasoningEffort || REASONING_EFFORT_AUTO}
                  onChange={(v) => set('reasoningEffort', isJennaReasoningEffort(v) ? v : '')}
                />
              )}
            </SimpleGrid>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>

      <SaveActions
        save={{
          dirty,
          saving,
          blocked: hasErrors(errors) || (snap.saving !== null && !saving) || testing,
          onSave: () => (live ? setConfirmLive(true) : void save()),
          onReset: reset,
          saveLabel,
        }}
        extra={
          <Group gap="xs" wrap="wrap">
            <Button
              variant="outline"
              leftSection={<IconPlugConnected size={16} />}
              onClick={runTest}
              loading={testing}
              disabled={testDisabledReason !== null || snap.saving !== null}
              aria-describedby={testDisabledReason ? testHintId : undefined}
            >
              {provider.lastTestAt ? 'Tes ulang' : 'Tes koneksi'}
            </Button>
            {testDisabledReason && (
              <Text id={testHintId} size="xs" c={tokens.colors.text.muted}>
                {testDisabledReason}
              </Text>
            )}
          </Group>
        }
      />

      <ConfirmModal
        opened={confirmLive}
        title="Simpan provider yang sedang dipakai?"
        message={`Provider ${providerName(provider)} sedang melayani chat publik. Perubahan langsung berlaku ${
          runsTest
            ? 'dan hasil tes sebelumnya direset lalu tes dijalankan ulang.'
            : 'dan hasil tes koneksi sebelumnya akan direset.'
        }`}
        confirmLabel={saveLabel}
        loading={saving}
        onConfirm={() => void save()}
        onClose={() => setConfirmLive(false)}
      />
    </Stack>
  );
}
