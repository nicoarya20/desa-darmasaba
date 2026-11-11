'use client'
import { Center, Stack, Text } from '@mantine/core';
import { IconInbox } from '@tabler/icons-react';

/** Placeholder saat data kosong (bukan sedang loading). */
export default function EmptyState({ label }: { label: string }) {
  return (
    <Center py="xl" w="100%">
      <Stack align="center" gap={6} c="gray">
        <IconInbox size={40} stroke={1.4} />
        <Text fz="sm" c="dimmed">
          {label}
        </Text>
      </Stack>
    </Center>
  );
}
