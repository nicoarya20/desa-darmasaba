'use client';
import { apbdesDokumenGroups, showGroupTitles, type ApbdesDokumenSumber } from '@/lib/apbdes-dokumen-groups';
import { Box, Button, Group, Stack, Text } from '@mantine/core';
import { IconFile, IconFolder } from '@tabler/icons-react';

/** Daftar dokumen APBDes (hanya baca) per folder di detail admin: "Umum" dulu, lalu folder; tiap dokumen bisa dibuka. */
export function ApbdesDokumenList({ apbdes }: { apbdes: ApbdesDokumenSumber }) {
  const groups = apbdesDokumenGroups(apbdes);
  if (groups.length === 0) {
    return (
      <Text fz="sm" c="dimmed">
        Tidak ada dokumen
      </Text>
    );
  }
  const withTitles = showGroupTitles(groups);

  return (
    <Stack gap="sm" mt="xs">
      {groups.map((group) => (
        <Box key={group.key} data-folder-key={group.key}>
          {withTitles && (
            <Group gap={6} mb={4}>
              <IconFolder size={16} />
              <Text fw={600} fz="sm">
                {group.nama} ({group.dokumen.length})
              </Text>
            </Group>
          )}
          <Stack gap={4}>
            {group.dokumen.map((doc) => (
              <Group key={doc.id} justify="space-between" wrap="nowrap" gap="sm">
                <Text fz="sm" style={{ wordBreak: 'break-word' }}>
                  {doc.judul}
                </Text>
                <Button
                  component="a"
                  href={doc.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="light"
                  size="xs"
                  leftSection={<IconFile size={14} />}
                >
                  Lihat
                </Button>
              </Group>
            ))}
          </Stack>
        </Box>
      ))}
    </Stack>
  );
}
