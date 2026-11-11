'use client';

import colors from '@/con/colors';
import { Text, UnstyledButton } from '@mantine/core';

type SearchShowMoreButtonProps = {
  hiddenCount: number;
  onExpand: () => void;
};

/** Baris tombol "Tampilkan N halaman lainnya" di akhir bagian Halaman dropdown pencarian. */
export default function SearchShowMoreButton({ hiddenCount, onExpand }: SearchShowMoreButtonProps) {
  return (
    <UnstyledButton
      type="button"
      w="100%"
      p="sm"
      style={{ borderBottom: `1px solid ${colors.grey[1]}`, transition: 'background 0.2s' }}
      onMouseEnter={(e) => (e.currentTarget.style.background = colors['blue-button-1'])}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      onClick={(e) => {
        // buka di tempat: jangan menutup popover atau memicu navigasi baris hasil
        e.preventDefault();
        e.stopPropagation();
        onExpand();
      }}
    >
      <Text size="sm" fw={500} c={colors['blue-button']}>
        Tampilkan {hiddenCount} halaman lainnya
      </Text>
    </UnstyledButton>
  );
}
