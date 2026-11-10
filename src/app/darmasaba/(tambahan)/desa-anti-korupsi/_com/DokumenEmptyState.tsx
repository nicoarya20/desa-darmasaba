import colors from '@/con/colors';
import { Flex, Text } from '@mantine/core';
import { IconInbox } from '@tabler/icons-react';
import type { ReactNode } from 'react';

/** Keadaan kosong halaman program publik (program/folder tanpa dokumen, hasil cari kosong). */
export function DokumenEmptyState({ children }: { children: ReactNode }) {
  return (
    <Flex direction="column" align="center" justify="center" gap="sm" py="xl" data-testid="empty-state">
      <IconInbox size={48} stroke={1.5} color={colors['blue-button']} />
      <Text fz="md" fw={500} c="dimmed" ta="center">
        {children}
      </Text>
    </Flex>
  );
}
