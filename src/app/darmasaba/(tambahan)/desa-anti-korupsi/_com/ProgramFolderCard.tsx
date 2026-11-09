import colors from '@/con/colors';
import { isPdfMime, type DokumenDesaAntiKorupsiView } from '@/lib/desa-anti-korupsi-dokumen';
import { ActionIcon, Badge, Group, Paper, Stack, Text, Tooltip } from '@mantine/core';
import { IconDownload, IconEye, IconFileText, IconFolder } from '@tabler/icons-react';

type Props = {
  name: string;
  dokumen: readonly DokumenDesaAntiKorupsiView[];
  onPreview: (dokumen: DokumenDesaAntiKorupsiView) => void;
};

/** Kartu program publik: "folder" berisi daftar dokumen, tiap dokumen bisa dipratinjau/diunduh. */
export function ProgramFolderCard({ name, dokumen, onPreview }: Props) {
  return (
    <Paper
      p="lg"
      shadow="md"
      radius="xl"
      withBorder
      style={{ background: 'linear-gradient(135deg, #ffffff, #f8fbff)' }}
    >
      <Stack h="100%" gap="sm">
        <Text fz="lg" fw={600} c={colors['blue-button']}>
          {name}
        </Text>
        <Group gap={6}>
          <IconFolder size={18} color={colors['blue-button']} />
          <Badge variant="light" color={colors['blue-button']} data-testid="jumlah-dokumen">
            {dokumen.length} dokumen
          </Badge>
        </Group>

        {dokumen.length === 0 ? (
          <Text fz="sm" c="dimmed">
            Belum ada dokumen
          </Text>
        ) : (
          <Stack gap={6} component="ul" m={0} p={0} style={{ listStyle: 'none' }}>
            {dokumen.map((d) => {
              const pdf = isPdfMime(d.file.mimeType);
              return (
                <Group key={d.id} component="li" gap="xs" wrap="nowrap" justify="space-between" data-dokumen-id={d.id}>
                  <Group gap={6} wrap="nowrap" miw={0}>
                    <IconFileText size={16} style={{ flexShrink: 0 }} />
                    <Text fz="sm" truncate>
                      {d.judul}
                    </Text>
                  </Group>
                  <Group gap={4} wrap="nowrap">
                    {pdf && (
                      <Tooltip label="Pratinjau" withArrow>
                        <ActionIcon
                          variant="light"
                          color={colors['blue-button']}
                          radius="xl"
                          aria-label={`Pratinjau ${d.judul}`}
                          onClick={() => onPreview(d)}
                        >
                          <IconEye size={16} />
                        </ActionIcon>
                      </Tooltip>
                    )}
                    <Tooltip label="Unduh file" withArrow>
                      <ActionIcon
                        component="a"
                        href={d.file.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        download={pdf ? d.file.realName : undefined}
                        variant="filled"
                        color={colors['blue-button']}
                        radius="xl"
                        aria-label={`Unduh ${d.judul}`}
                      >
                        <IconDownload size={16} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Group>
              );
            })}
          </Stack>
        )}
      </Stack>
    </Paper>
  );
}
