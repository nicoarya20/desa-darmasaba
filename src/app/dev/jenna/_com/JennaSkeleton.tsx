'use client';
import { Skeleton, Stack } from '@mantine/core';
import { UnifiedCard } from '@/components/admin/UnifiedSurface';

const CARD_HEIGHTS = [120, 220, 260, 420];

export function JennaSkeleton() {
  return (
    <Stack gap="lg" aria-busy="true" aria-label="Memuat pengaturan Jenna">
      {CARD_HEIGHTS.map((height) => (
        <UnifiedCard key={height} padding="lg">
          <Stack gap="sm">
            <Skeleton height={20} width="30%" radius="sm" />
            <Skeleton height={12} width="60%" radius="sm" />
            <Skeleton height={height - 60} radius="md" mt="sm" />
          </Stack>
        </UnifiedCard>
      ))}
    </Stack>
  );
}
