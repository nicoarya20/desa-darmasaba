'use client';
import { Anchor, Divider, Group, Stack, Text, Title } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { useSnapshot } from 'valtio';
import colors from '@/con/colors';
import stateDokumenDasarHukum from '../../../_state/ppid/dasar_hukum/dokumenDasarHukum';
import { DOKUMEN_ADMIN_TEXT as T } from './dokumen-dasar-hukum.text';

/** Pratinjau admin daftar Dokumen Dasar Hukum (judul + tautan "Lihat"); tersembunyi bila belum ada dokumen. */
export function DokumenDasarHukumPreview() {
  const snap = useSnapshot(stateDokumenDasarHukum);

  useShallowEffect(() => {
    void stateDokumenDasarHukum.list.load();
  }, []);

  if (snap.list.data.length === 0) return null;
  return (
    <>
      <Divider my="xl" color={colors['blue-button']} />
      <Stack gap="xs">
        <Title order={4} c={colors['blue-button']}>{T.title}</Title>
        {snap.list.data.map((item, index) => (
          <Group key={item.id} justify="space-between" wrap="nowrap" align="flex-start">
            <Text fz="sm" style={{ wordBreak: 'break-word' }}>{`${index + 1}. ${item.judul}`}</Text>
            <Anchor href={item.file.link} target="_blank" rel="noopener noreferrer" fz="sm" underline="never">
              {T.lihat}
            </Anchor>
          </Group>
        ))}
      </Stack>
    </>
  );
}
