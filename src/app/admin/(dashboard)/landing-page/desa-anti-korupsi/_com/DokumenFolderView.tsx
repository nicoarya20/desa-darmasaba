'use client';
import { isPdfMime, type DokumenDesaAntiKorupsiView } from '@/lib/desa-anti-korupsi-dokumen';
import { Anchor, Badge, Button, Group, Paper, Stack, Text } from '@mantine/core';
import { IconEye, IconFolder } from '@tabler/icons-react';
import { useState } from 'react';
import { DokumenPreviewFrame } from './DokumenPreviewFrame';

/** Detail admin: daftar isi folder dokumen program + pratinjau PDF per dokumen. */
export function DokumenFolderView({ dokumen }: { dokumen: readonly DokumenDesaAntiKorupsiView[] }) {
  const firstPdf = dokumen.find((d) => isPdfMime(d.file.mimeType));
  const [previewId, setPreviewId] = useState<string | null>(firstPdf?.id ?? null);
  const preview = dokumen.find((d) => d.id === previewId) ?? null;

  if (dokumen.length === 0) {
    return (
      <Text fz="sm" c="dimmed">
        Tidak ada dokumen tersedia
      </Text>
    );
  }

  return (
    <Stack gap="sm">
      <Group gap={6}>
        <IconFolder size={18} />
        <Text fz="sm" c="dimmed">
          {dokumen.length} dokumen
        </Text>
      </Group>
      {dokumen.map((d, index) => (
        <Paper key={d.id} withBorder radius="md" p="sm">
          <Group justify="space-between" wrap="nowrap">
            <Group gap="xs" wrap="nowrap" miw={0}>
              <Badge variant="light">{index + 1}</Badge>
              <Stack gap={0} miw={0}>
                <Text fw={500} truncate>
                  {d.judul}
                </Text>
                <Anchor href={d.file.link} target="_blank" rel="noopener noreferrer" fz="xs">
                  {d.file.realName}
                </Anchor>
              </Stack>
            </Group>
            <Button
              size="xs"
              variant={previewId === d.id ? 'filled' : 'light'}
              leftSection={<IconEye size={14} />}
              disabled={!isPdfMime(d.file.mimeType)}
              onClick={() => setPreviewId(d.id)}
            >
              Pratinjau
            </Button>
          </Group>
        </Paper>
      ))}
      {preview && <DokumenPreviewFrame src={preview.file.link} title={preview.judul} />}
    </Stack>
  );
}
