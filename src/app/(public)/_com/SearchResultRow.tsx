'use client';

import { Box, Text } from '@mantine/core';
import s from './global-search.module.css';

type SearchResultRowProps = {
  title: string;
  subtitle: string;
  isNavigating: boolean;
  onClick: (e: React.MouseEvent) => void;
};

/** Satu baris hasil di dropdown pencarian global (judul + keterangan abu). */
export default function SearchResultRow({ title, subtitle, isNavigating, onClick }: SearchResultRowProps) {
  return (
    <Box
      p="sm"
      className={`search-result-item ${s.row}`} // search-result-item: penanda baris hasil (cegah popover tertutup)
      data-navigating={isNavigating}
      onClick={onClick}
    >
      <Text size="sm" fw={500} lineClamp={1}>
        {title}
      </Text>
      <Text size="xs" c="dimmed" lineClamp={1}>
        {subtitle}
      </Text>
    </Box>
  );
}
