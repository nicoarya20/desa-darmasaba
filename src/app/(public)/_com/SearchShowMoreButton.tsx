'use client';

import { Text, UnstyledButton } from '@mantine/core';
import s from './global-search.module.css';

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
      className={s.showMore}
      onClick={(e) => {
        // buka di tempat: jangan menutup popover atau memicu navigasi baris hasil
        e.preventDefault();
        e.stopPropagation();
        onExpand();
      }}
    >
      <Text size="sm" fw={500} c="var(--c-brand)">
        Tampilkan {hiddenCount} halaman lainnya
      </Text>
    </UnstyledButton>
  );
}
