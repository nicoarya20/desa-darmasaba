'use client';
import { Alert, Button, Stack, Text } from '@mantine/core';
import { IconAlertTriangle, IconRefresh } from '@tabler/icons-react';

type Props = { title: string; message: string; onRetry: () => void; retrying?: boolean };

export function ErrorState({ title, message, onRetry, retrying }: Props) {
  return (
    <Alert color="red" variant="light" title={title} icon={<IconAlertTriangle size={18} />} role="alert">
      <Stack gap="sm" align="flex-start">
        <Text size="sm">{message}</Text>
        <Button
          size="xs"
          variant="white"
          color="red"
          leftSection={<IconRefresh size={14} />}
          onClick={onRetry}
          loading={retrying}
        >
          Coba lagi
        </Button>
      </Stack>
    </Alert>
  );
}
