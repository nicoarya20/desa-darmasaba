import colors from '@/con/colors';
import { Flex, Text } from '@mantine/core';
import { IconInbox } from '@tabler/icons-react';
import type { ReactNode } from 'react';

type Props = {
  /** Pesan utama. */
  children: ReactNode;
  /** Keterangan tambahan di bawah pesan utama. */
  subteks?: ReactNode;
  /** Aksi lanjutan (mis. tombol kembali ke semua folder). */
  aksi?: ReactNode;
};

/** Keadaan kosong halaman program publik (program/folder tanpa dokumen, hasil cari kosong). */
export function DokumenEmptyState({ children, subteks, aksi }: Props) {
  return (
    <Flex direction="column" align="center" justify="center" gap="xs" py="xl" px="md" data-testid="empty-state">
      <Flex
        align="center"
        justify="center"
        w={64}
        h={64}
        mb={4}
        bg={colors['blue-button-1']}
        style={{ borderRadius: '50%' }}
        aria-hidden
      >
        <IconInbox size={30} stroke={1.4} color={colors['blue-button-4']} />
      </Flex>
      <Text fz="md" fw={600} c={colors['blue-button-7']} ta="center">
        {children}
      </Text>
      {subteks && (
        <Text fz="sm" c="dimmed" ta="center" maw={420}>
          {subteks}
        </Text>
      )}
      {aksi && <Flex mt="xs">{aksi}</Flex>}
    </Flex>
  );
}
