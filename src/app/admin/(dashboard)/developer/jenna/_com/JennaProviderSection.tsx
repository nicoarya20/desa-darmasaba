'use client';
import { Badge, Group, SegmentedControl, Stack, Tabs, Text } from '@mantine/core';
import { useState } from 'react';
import { useSnapshot } from 'valtio';
import {
  JENNA_CHAT_PROTOCOLS,
  JENNA_PROTOCOL_SLOT,
  JENNA_SLOT_PROTOCOL,
  type JennaChatProtocol,
  type JennaSlot,
} from '@/lib/jenna/types';
import { useDarkMode } from '@/state/darkModeStore';
import { themeTokens } from '@/utils/themeTokens';
import jennaState from '../../../_state/developer/jenna-state';
import { ConfirmModal } from '../../_com/ConfirmModal';
import { SectionCard } from '../../_com/SectionCard';
import { JennaProviderForm } from './JennaProviderForm';
import { PROTOCOL_LABEL } from './protocol';

/** Pemilihan protokol aktif + form tiap slot provider (tab). */
export function JennaProviderSection() {
  const { isDark } = useDarkMode();
  const tokens = themeTokens(isDark);
  const snap = useSnapshot(jennaState);
  const config = snap.config;
  const [tab, setTab] = useState<JennaSlot>(
    config ? JENNA_PROTOCOL_SLOT[config.settings.chatProtocol] : JENNA_PROTOCOL_SLOT.openai,
  );
  const [pendingProtocol, setPendingProtocol] = useState<JennaChatProtocol | null>(null);

  if (!config) return null;
  const { settings, cryptoConfigured, providers } = config;
  const readyOf = (protocol: JennaChatProtocol) =>
    Boolean(providers.find((p) => p.slot === JENNA_PROTOCOL_SLOT[protocol])?.ready);
  const pendingReady = pendingProtocol ? readyOf(pendingProtocol) : false;

  const applyProtocol = async () => {
    if (!pendingProtocol) return;
    const result = await jennaState.saveSettings(
      'protocol',
      { chatProtocol: pendingProtocol },
      `Protokol aktif diganti ke ${PROTOCOL_LABEL[pendingProtocol]}.`,
    );
    if (result) {
      setTab(JENNA_PROTOCOL_SLOT[pendingProtocol]);
      setPendingProtocol(null);
    }
  };

  return (
    <SectionCard
      title="Provider"
      description="Layanan AI yang dipakai Jenna. Isi kedua provider bila perlu, lalu pilih satu sebagai protokol aktif."
    >
      <Stack gap={6}>
        <Text size="sm" fw={500} c={tokens.colors.text.primary} id="jenna-protocol-label">
          Protokol aktif
        </Text>
        <SegmentedControl
          aria-labelledby="jenna-protocol-label"
          fullWidth
          value={settings.chatProtocol}
          disabled={snap.saving !== null}
          onChange={(value) => {
            if (value !== settings.chatProtocol) setPendingProtocol(value as JennaChatProtocol);
          }}
          data={JENNA_CHAT_PROTOCOLS.map((protocol) => ({ value: protocol, label: PROTOCOL_LABEL[protocol] }))}
        />
        <Text size="xs" c={tokens.colors.text.muted}>
          Chat publik hanya memakai provider dari protokol aktif.
        </Text>
      </Stack>

      <Tabs value={tab} onChange={(value) => value && setTab(value as JennaSlot)} keepMounted>
        <Tabs.List grow>
          {providers.map((p) => {
            const protocol = JENNA_SLOT_PROTOCOL[p.slot];
            return (
              <Tabs.Tab key={p.slot} value={p.slot}>
                <Group gap={6} wrap="nowrap" justify="center">
                  <span>{PROTOCOL_LABEL[protocol]}</span>
                  {protocol === settings.chatProtocol && (
                    <Badge size="xs" variant="filled" color="blue">
                      Aktif
                    </Badge>
                  )}
                  {snap.dirty[p.slot] && (
                    <Badge size="xs" variant="light" color="yellow" aria-label="Ada perubahan belum disimpan">
                      •
                    </Badge>
                  )}
                </Group>
              </Tabs.Tab>
            );
          })}
        </Tabs.List>
        {providers.map((p) => (
          <Tabs.Panel key={p.slot} value={p.slot}>
            <JennaProviderForm
              provider={p}
              cryptoConfigured={cryptoConfigured}
              live={settings.enabled && JENNA_SLOT_PROTOCOL[p.slot] === settings.chatProtocol}
            />
          </Tabs.Panel>
        ))}
      </Tabs>

      <ConfirmModal
        opened={pendingProtocol !== null}
        title="Ganti protokol aktif?"
        message={
          pendingProtocol
            ? `Jenna akan memakai provider ${PROTOCOL_LABEL[pendingProtocol]}.${
                pendingReady
                  ? ''
                  : ' Provider ini belum lengkap, sehingga chat publik akan gagal sampai dilengkapi.'
              }${settings.enabled ? ' Perubahan langsung berlaku untuk pengunjung.' : ''}`
            : ''
        }
        confirmLabel="Ganti protokol"
        confirmColor={pendingReady ? 'blue' : 'orange'}
        loading={snap.saving === 'protocol'}
        onConfirm={() => void applyProtocol()}
        onClose={() => setPendingProtocol(null)}
      />
    </SectionCard>
  );
}
