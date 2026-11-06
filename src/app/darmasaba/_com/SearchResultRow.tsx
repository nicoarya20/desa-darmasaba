'use client';

import { Box, Text } from '@mantine/core';

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
      className="search-result-item" // Add class untuk prevent close
      style={{
        borderBottom: '1px solid #f1f1f1',
        cursor: isNavigating ? 'wait' : 'pointer',
        background: 'white',
        transition: 'background 0.2s',
        opacity: isNavigating ? 0.6 : 1,
      }}
      onMouseEnter={(e) => !isNavigating && (e.currentTarget.style.background = '#f9f9f9')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'white')}
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
