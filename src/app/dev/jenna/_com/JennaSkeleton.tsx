'use client';
import { Skeleton, Stack } from '@mantine/core';
import { UnifiedCard } from '@/components/admin/UnifiedSurface';

type Props = { heights: readonly number[]; label?: string };

export function JennaSkeleton({ heights, label = 'Memuat pengaturan Jenna' }: Props) {
  return (
    <Stack gap="lg" aria-busy="true" aria-label={label}>
      {heights.map((height, i) => (
        <UnifiedCard key={i} padding="lg">
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
