'use client';
import {
  Alert,
  Badge,
  Button,
  Group,
  NumberInput,
  PasswordInput,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { IconKey, IconPlugConnected } from '@tabler/icons-react';
import { useId, useState } from 'react';
import { useSnapshot } from 'valtio';
import { JENNA_PROVIDER_LIMITS } from '@/lib/jenna/types';
import { useDarkMode } from '@/state/darkModeStore';
import { themeTokens } from '@/utils/themeTokens';
import jennaState from '../../_state/jenna-state';
import { ConfirmModal } from '../../_com/ConfirmModal';
import { formatDateTime } from '../../_com/format';
import { SaveActions } from '../../_com/SectionCard';
import {
  TIMEOUT_SEC_RANGE,
  hasErrors,
  isVoiceProvider,
  providerCopy,
  providerEqual,
  providerErrors,
  providerFormFrom,
  providerPayload,
  voiceProviderPayload,
  type AnyProviderDTO,
  type NumberField,
  type ProviderForm,
} from '../jenna-form.logic';
import { JennaProviderKeyDelete } from './JennaProviderKeyDelete';
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

export function JennaProviderForm({ provider, live, cryptoConfigured }: Props) {
  const { isDark } = useDarkMode();
  const tokens = themeTokens(isDark);
  const snap = useSnapshot(jennaState);
  const testHintId = useId();
  const baseline = providerFormFrom(provider);
  const [form, setForm] = useState<ProviderForm>(baseline);
  const [replacingKey, setReplacingKey] = useState(!provider.hasApiKey);
  const [confirmLive, setConfirmLive] = useState(false);

  const { slot } = provider;
  const voice = isVoiceProvider(provider);
  const copy = providerCopy(provider);
  const dirty = !providerEqual(form, baseline);
  const errors = providerErrors(form, voice);
  const saving = snap.saving === slot;
  const testing = snap.testingSlot === slot;
  useReportDirty(slot, dirty);

  const set = <K extends keyof ProviderForm>(key: K, value: ProviderForm[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const reset = () => {
    setForm(baseline);
    setReplacingKey(!provider.hasApiKey);
  };

  const save = async () => {
    const result = isVoiceProvider(provider)
      ? await jennaState.saveVoiceProvider(voiceProviderPayload(form))
      : await jennaState.saveProvider(provider.slot, providerPayload(form));
    setConfirmLive(false);
    const saved = voice ? result?.voiceProvider : result?.providers.find((p) => p.slot === slot);
    if (saved) {
      setForm(providerFormFrom(saved));
      setReplacingKey(!saved.hasApiKey);
    }
  };

  const testDisabledReason = !cryptoConfigured
    ? 'Kunci enkripsi server belum diatur.'
    : dirty
      ? 'Simpan perubahan dulu sebelum menguji koneksi.'
      : !provider.ready
        ? 'Lengkapi Base URL, model, dan API key lalu simpan.'
        : null;

  return (
    <Stack gap="md" pt="md">
      <Group gap="xs" wrap="wrap">
        <Badge color={provider.ready ? 'green' : 'orange'} variant="light">
          {provider.ready ? 'Konfigurasi lengkap' : 'Belum lengkap'}
        </Badge>
        {provider.updatedAt && (
          <Text size="xs" c={tokens.colors.text.muted}>
            Disimpan {formatDateTime(provider.updatedAt)}
          </Text>
        )}
      </Group>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
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
        <TextInput
          label={copy.modelLabel}
          description={copy.modelDescription}
          placeholder={copy.modelPlaceholder}
          required
          autoComplete="off"
          spellCheck={false}
          maxLength={JENNA_PROVIDER_LIMITS.model.maxLength}
          value={form.model}
          onChange={(e) => set('model', e.currentTarget.value)}
          error={dirty ? errors.model : undefined}
        />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
        {!voice && (
          <>
            <NumberInput
              label="Temperature"
              description={`${JENNA_PROVIDER_LIMITS.temperature.min}–${JENNA_PROVIDER_LIMITS.temperature.max}. Kosongkan = default provider.`}
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
      </SimpleGrid>

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

      <Stack gap={4}>
        <Text size="sm" fw={500} c={tokens.colors.text.primary}>
          Tes koneksi terakhir
        </Text>
        {provider.lastTestAt ? (
          <Group gap="xs" wrap="wrap" aria-live="polite">
            <Badge color={provider.lastTestOk ? 'green' : 'red'} variant="light">
              {provider.lastTestOk ? 'Berhasil' : 'Gagal'}
            </Badge>
            <Text size="xs" c={tokens.colors.text.muted}>
              {formatDateTime(provider.lastTestAt)}
            </Text>
            {provider.lastTestMessage && (
              <Text size="xs" c={tokens.colors.text.secondary} style={{ flexBasis: '100%' }}>
                {provider.lastTestMessage}
              </Text>
            )}
          </Group>
        ) : (
          <Text size="xs" c={tokens.colors.text.muted}>
            Belum pernah dites.
          </Text>
        )}
      </Stack>

      <SaveActions
        save={{
          dirty,
          saving,
          blocked: hasErrors(errors) || (snap.saving !== null && !saving) || testing,
          onSave: () => (live ? setConfirmLive(true) : void save()),
          onReset: reset,
          saveLabel: 'Simpan provider',
        }}
        extra={
          <Group gap="xs" wrap="wrap">
            <Button
              variant="outline"
              leftSection={<IconPlugConnected size={16} />}
              onClick={() =>
                void (isVoiceProvider(provider) ? jennaState.testVoiceProvider() : jennaState.testProvider(provider.slot))
              }
              loading={testing}
              disabled={testDisabledReason !== null || snap.saving !== null}
              aria-describedby={testDisabledReason ? testHintId : undefined}
            >
              Tes koneksi
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
        message={`Provider ${providerName(provider)} sedang melayani chat publik. Perubahan langsung berlaku dan hasil tes koneksi sebelumnya akan direset.`}
        confirmLabel="Simpan"
        loading={saving}
        onConfirm={() => void save()}
        onClose={() => setConfirmLive(false)}
      />
    </Stack>
  );
}
