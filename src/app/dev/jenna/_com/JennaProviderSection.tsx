'use client';
import { Box, SimpleGrid } from '@mantine/core';
import { useId, useState } from 'react';
import { useSnapshot } from 'valtio';
import {
  JENNA_PROTOCOL_SLOT,
  JENNA_SLOT_PROTOCOL,
  type JennaChatProtocol,
  type JennaSlot,
} from '@/lib/jenna/types';
import jennaState from '../../_state/jenna-state';
import { ConfirmModal } from '../../_com/ConfirmModal';
import { SectionCard } from '../../_com/SectionCard';
import { JennaProviderCard } from './JennaProviderCard';
import { JennaProviderForm } from './JennaProviderForm';
import { PROTOCOL_LABEL } from './protocol';

/** Kartu tiap slot provider (pilih form + ganti protokol aktif) dan form slot terpilih. */
export function JennaProviderSection() {
  const panelIdPrefix = useId();
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
      description="Pilih provider yang dipakai Jenna untuk chat publik. Klik kartu untuk mengatur."
    >
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        {providers.map((p) => {
          const protocol = JENNA_SLOT_PROTOCOL[p.slot];
          return (
            <JennaProviderCard
              key={p.slot}
              provider={p}
              active={protocol === settings.chatProtocol}
              selected={tab === p.slot}
              dirty={Boolean(snap.dirty[p.slot])}
              testing={snap.testingSlot === p.slot}
              panelId={`${panelIdPrefix}-${p.slot}`}
              activateDisabled={snap.saving !== null}
              onSelect={() => setTab(p.slot)}
              onActivate={() => setPendingProtocol(protocol)}
            />
          );
        })}
      </SimpleGrid>

      {/* Semua form tetap ter-mount supaya draf & status dirty tiap slot tidak hilang saat pindah kartu. */}
      {providers.map((p) => (
        <Box
          key={p.slot}
          id={`${panelIdPrefix}-${p.slot}`}
          role="region"
          aria-label={`Pengaturan ${PROTOCOL_LABEL[JENNA_SLOT_PROTOCOL[p.slot]]}`}
          hidden={tab !== p.slot}
        >
          <JennaProviderForm
            provider={p}
            cryptoConfigured={cryptoConfigured}
            live={settings.enabled && JENNA_SLOT_PROTOCOL[p.slot] === settings.chatProtocol}
          />
        </Box>
      ))}

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
