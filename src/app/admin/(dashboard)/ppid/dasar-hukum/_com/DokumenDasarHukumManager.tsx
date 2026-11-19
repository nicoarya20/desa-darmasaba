'use client';
import { Box, Button, Paper, Stack, Text, Title } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { useState } from 'react';
import { useSnapshot } from 'valtio';
import colors from '@/con/colors';
import PdfMultiDropzoneField from '@/app/admin/_com/upload/PdfMultiDropzoneField';
import { JUDUL_DOKUMEN_MAX } from '@/app/api/[[...slugs]]/_lib/ppid/dasar_hukum/dokumen/dokumen.rules';
import stateDokumenDasarHukum from '../../../_state/ppid/dasar_hukum/dokumenDasarHukum';
import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';
import { DokumenDasarHukumRow } from './DokumenDasarHukumRow';
import { DOKUMEN_ADMIN_TEXT as T } from './dokumen-dasar-hukum.text';

/** Pengelola Dokumen Dasar Hukum: unggah banyak PDF sekaligus, ubah judul, atur urutan, lihat, dan hapus (langsung tersimpan). */
export function DokumenDasarHukumManager() {
  // sync: true agar caret input judul tidak loncat (useSnapshot bawaan memperbarui asinkron).
  const snap = useSnapshot(stateDokumenDasarHukum, { sync: true });
  const [hapusId, setHapusId] = useState<string | null>(null);
  const hapusItem = snap.list.data.find((row) => row.id === hapusId);
  const busy = snap.list.busyId !== null || snap.pending.saving;

  useShallowEffect(() => {
    void stateDokumenDasarHukum.list.load();
  }, []);

  const confirmHapus = async () => {
    if (hapusId) await stateDokumenDasarHukum.list.remove(hapusId);
    setHapusId(null);
  };

  return (
    <Paper
      w={{ base: '100%', md: '50%' }}
      bg={colors['white-1']}
      p="lg"
      mt="lg"
      radius="md"
      shadow="sm"
      style={{ border: '1px solid #e0e0e0' }}
    >
      <Stack gap="lg">
        <Box>
          <Title order={5}>{T.title}</Title>
          <Text fz="xs" c="dimmed">{T.note}</Text>
        </Box>

        <Stack gap="sm">
          <PdfMultiDropzoneField
            label={T.uploadLabel}
            description={T.uploadDescription}
            items={snap.pending.items}
            onChange={stateDokumenDasarHukum.pending.setItems}
            maxJudulLength={JUDUL_DOKUMEN_MAX}
            disabled={snap.pending.saving}
          />
          {snap.pending.items.length > 0 && (
            <Button
              w="fit-content"
              loading={snap.pending.saving}
              disabled={busy}
              onClick={() => void stateDokumenDasarHukum.pending.createMany()}
            >
              {T.simpan}
            </Button>
          )}
        </Stack>

        <Stack gap="xs">
          {snap.list.data.length === 0 && <Text fz="sm" c="dimmed">{T.empty}</Text>}
          {snap.list.data.map((item, index) => (
            <DokumenDasarHukumRow
              key={item.id}
              item={item}
              draft={snap.list.drafts[item.id]}
              isFirst={index === 0}
              isLast={index === snap.list.data.length - 1}
              disabled={busy}
              onDraft={(judul) => stateDokumenDasarHukum.list.setDraft(item.id, judul)}
              onSaveJudul={() => void stateDokumenDasarHukum.list.rename(item.id)}
              onMove={(delta) => void stateDokumenDasarHukum.list.move(item.id, delta)}
              onDelete={() => setHapusId(item.id)}
            />
          ))}
        </Stack>
      </Stack>

      <ModalKonfirmasiHapus
        opened={hapusId !== null}
        loading={snap.list.busyId === hapusId}
        onClose={() => setHapusId(null)}
        onConfirm={() => void confirmHapus()}
        text={T.konfirmasiHapus(hapusItem?.judul ?? '')}
      />
    </Paper>
  );
}
