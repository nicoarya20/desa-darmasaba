import { Button, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { PROGRAM_DETAIL_TEXT as T } from '../program-kemiskinan.text';
import type { MuatState } from '../program-kemiskinan.types';

type Props = { status: Exclude<MuatState<unknown>['status'], 'ready'>; onRetry: () => void; tinggi?: number };

/** Keadaan selain siap: kerangka memuat, tidak ditemukan, atau galat dengan tombol coba lagi. */
export function MuatStatus({ status, onRetry, tinggi = 160 }: Props) {
  if (status === 'loading') {
    return (
      <div role="status" aria-label={T.memuat}>
        <Skeleton h={tinggi} radius="md" />
      </div>
    );
  }
  const galat = status === 'error';
  return (
    <Paper p="lg" radius="md" withBorder role={galat ? 'alert' : undefined}>
      <Stack gap={6} align="center">
        <Text fw={700}>{galat ? T.errorTitle : T.notFoundTitle}</Text>
        <Text fz="sm" c="dimmed">
          {galat ? T.errorDesc : T.notFoundDesc}
        </Text>
        {galat && (
          <Button variant="light" onClick={onRetry}>
            {T.cobaLagi}
          </Button>
        )}
      </Stack>
    </Paper>
  );
}
