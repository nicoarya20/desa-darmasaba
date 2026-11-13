'use client';
import { Box, Button, Group, Stack, Text, Title } from '@mantine/core';
import { IconDeviceFloppy } from '@tabler/icons-react';
import { useId } from 'react';
import { UnifiedCard } from '@/components/admin/UnifiedSurface';
import { useDarkMode } from '@/state/darkModeStore';
import { themeTokens } from '@/utils/themeTokens';

const SAVE_GRADIENT = 'linear-gradient(135deg, #0A4E78, #4facfe)';

export type SaveBar = {
  dirty: boolean;
  saving: boolean;
  /** Tombol simpan nonaktif walau dirty (mis. ada galat validasi / bagian lain sedang disimpan). */
  blocked?: boolean;
  onSave: () => void;
  onReset: () => void;
  saveLabel?: string;
};

/** Baris aksi Batalkan/Simpan; `extra` tampil di kiri (mis. tombol Tes koneksi). */
export function SaveActions({ save, extra }: { save: SaveBar; extra?: React.ReactNode }) {
  const { isDark } = useDarkMode();
  const tokens = themeTokens(isDark);
  const canSave = save.dirty && !save.blocked;

  return (
    <Group
      justify="flex-end"
      gap="sm"
      pt="md"
      wrap="wrap"
      style={{ borderTop: `1px solid ${tokens.colors.border.soft}` }}
    >
      <Group gap="sm" mr="auto" wrap="wrap">
        {extra}
        {save.dirty && (
          <Text size="xs" c={tokens.colors.warning} aria-live="polite">
            Ada perubahan yang belum disimpan.
          </Text>
        )}
      </Group>
      <Button variant="default" onClick={save.onReset} disabled={!save.dirty || save.saving}>
        Batalkan
      </Button>
      <Button
        leftSection={<IconDeviceFloppy size={16} />}
        onClick={save.onSave}
        loading={save.saving}
        disabled={!canSave}
        style={canSave ? { background: SAVE_GRADIENT } : undefined}
      >
        {save.saveLabel ?? 'Simpan'}
      </Button>
    </Group>
  );
}

type Props = {
  title: string;
  description?: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
  save?: SaveBar;
};

/** Kartu satu bagian pengaturan; simpan per bagian lewat `save`. */
export function SectionCard({ title, description, aside, children, save }: Props) {
  const { isDark } = useDarkMode();
  const tokens = themeTokens(isDark);
  const headingId = useId();

  return (
    <Box component="section" aria-labelledby={headingId}>
      <UnifiedCard padding="lg">
        <Stack gap="md">
          <Group justify="space-between" align="flex-start" gap="sm" wrap="wrap">
            <Box style={{ minWidth: 0, flex: '1 1 240px' }}>
              <Title order={4} id={headingId} c={tokens.colors.text.primary}>
                {title}
              </Title>
              {description && (
                <Text size="sm" c={tokens.colors.text.secondary} mt={4}>
                  {description}
                </Text>
              )}
            </Box>
            {aside}
          </Group>

          {children}

          {save && <SaveActions save={save} />}
        </Stack>
      </UnifiedCard>
    </Box>
  );
}
