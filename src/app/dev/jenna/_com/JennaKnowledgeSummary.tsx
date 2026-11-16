'use client';
import { Alert, Badge, Box, Button, Group, Modal, Progress, Stack, Text } from '@mantine/core';
import { IconAlertTriangle, IconEye } from '@tabler/icons-react';
import { useState } from 'react';
import type { Snapshot } from 'valtio';
import type { JennaKnowledgeResponse } from '@/lib/jenna/knowledge-types';
import { useDarkMode } from '@/state/darkModeStore';
import { themeTokens } from '@/utils/themeTokens';
import { SectionCard } from '../../_com/SectionCard';
import { formatDateTime, formatNumber } from '../../_com/format';
import type { UsageTone } from '../percakapan/percakapan.logic';
import { revalidateMinutes, snapshotSizeUsage } from '../pengetahuan/pengetahuan.logic';

const PROGRESS_COLOR: Record<UsageTone, string> = { ok: 'blue', warn: 'orange', error: 'red', neutral: 'gray' };

type Props = { snapshot: Snapshot<JennaKnowledgeResponse['snapshot']> };

/** Ukuran snapshot pengetahuan terhadap batas + tombol melihat teks persis yang dikirim ke AI. */
export function JennaKnowledgeSummary({ snapshot }: Props) {
  const { isDark } = useDarkMode();
  const tokens = themeTokens(isDark);
  const [showText, setShowText] = useState(false);
  const usage = snapshotSizeUsage(snapshot.chars, snapshot.maxChars, snapshot.truncated);
  const minutes = revalidateMinutes(snapshot.revalidateSeconds);

  return (
    <SectionCard
      title="Ringkasan Pengetahuan"
      description="Teks pengetahuan yang dikirim ke AI di setiap percakapan, dibangun dari data website publik."
      aside={
        usage.tone === 'warn' ? (
          <Badge color="orange" variant="light">
            Mendekati batas
          </Badge>
        ) : undefined
      }
    >
      {snapshot.truncated && (
        <Alert color="red" variant="light" icon={<IconAlertTriangle size={18} />} title="Pengetahuan terpotong" role="alert">
          Data website melebihi batas {formatNumber(snapshot.maxChars)} karakter, sehingga bagian akhir tidak ikut
          dikirim ke AI. Jenna bisa tidak mengetahui sebagian informasi.
        </Alert>
      )}

      <Stack gap={6}>
        <Progress
          value={usage.percent}
          color={PROGRESS_COLOR[usage.tone]}
          size="md"
          radius="xl"
          aria-label={`Ukuran pengetahuan ${Math.floor(usage.percent)}% dari batas`}
        />
        <Text size="sm" c={tokens.colors.text.primary}>
          {usage.label}
        </Text>
      </Stack>

      <Text size="sm" c={tokens.colors.text.secondary}>
        Halaman ini menampilkan data terbaru (dibangun {formatDateTime(snapshot.generatedAt)}). Chat publik
        memperbarui salinannya setiap {formatNumber(minutes)} menit, jadi perubahan data di admin bisa baru terlihat
        di jawaban Jenna setelah jeda itu.
      </Text>

      <Group>
        <Button variant="light" leftSection={<IconEye size={16} />} onClick={() => setShowText(true)}>
          Lihat isi yang dikirim ke AI
        </Button>
      </Group>

      <Modal
        opened={showText}
        onClose={() => setShowText(false)}
        title="Isi yang dikirim ke AI"
        size="xl"
        centered
        radius="md"
      >
        <Stack gap="sm">
          <Text size="xs" c={tokens.colors.text.muted}>
            {usage.label}. Hanya untuk dibaca.
          </Text>
          {/* Teks polos: isi snapshot tidak pernah dirender sebagai HTML/markdown. */}
          <Box
            component="pre"
            tabIndex={0}
            aria-label="Teks pengetahuan Jenna"
            m={0}
            p="sm"
            style={{
              maxHeight: '65vh',
              overflow: 'auto',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              fontFamily: 'var(--mantine-font-family-monospace)',
              fontSize: 'var(--mantine-font-size-xs)',
              lineHeight: 1.6,
              color: tokens.colors.text.primary,
              background: tokens.colors.bg.surface,
              border: `1px solid ${tokens.colors.border.soft}`,
              borderRadius: 8,
            }}
          >
            {snapshot.text}
          </Box>
        </Stack>
      </Modal>
    </SectionCard>
  );
}
