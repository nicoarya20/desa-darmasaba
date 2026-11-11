'use client'
import { Card, Skeleton, Stack } from '@mantine/core';

/** Skeleton kartu saat data sedang dimuat. */
export function CardSkeleton({ withImage = true }: { withImage?: boolean }) {
  return (
    <Card shadow="sm" radius="lg" withBorder h="100%" p={withImage ? 0 : 'md'}>
      {withImage && <Skeleton height={170} radius={0} />}
      <Stack gap={8} p={withImage ? 'md' : 0}>
        <Skeleton height={12} width="90%" radius="sm" />
        <Skeleton height={10} width="100%" radius="sm" />
        <Skeleton height={10} width="70%" radius="sm" />
        <Skeleton height={10} width="40%" radius="sm" mt={6} />
      </Stack>
    </Card>
  );
}
