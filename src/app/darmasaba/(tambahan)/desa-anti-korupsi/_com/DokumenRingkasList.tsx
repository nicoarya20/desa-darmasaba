import colors from '@/con/colors';
import { fileExtension, isPdfMime, type DokumenDesaAntiKorupsiView } from '@/lib/desa-anti-korupsi-dokumen';
import { ActionIcon, Badge, Group, Paper, Stack, Text, Tooltip } from '@mantine/core';
import {
  IconDownload,
  IconEye,
  IconFileText,
  IconFileTypeDoc,
  IconFileTypePdf,
  IconFileTypePpt,
  IconFileTypeXls,
} from '@tabler/icons-react';

/** Satu baris daftar: dokumen + label folder asal (dipakai hasil pencarian lintas folder). */
export type DokumenRingkasItem = { dokumen: DokumenDesaAntiKorupsiView; folderLabel?: string };

const ICON_BY_EXT: Record<string, typeof IconFileText> = {
  PDF: IconFileTypePdf,
  DOC: IconFileTypeDoc,
  DOCX: IconFileTypeDoc,
  XLS: IconFileTypeXls,
  XLSX: IconFileTypeXls,
  PPT: IconFileTypePpt,
  PPTX: IconFileTypePpt,
};

type Props = { items: readonly DokumenRingkasItem[]; onPreview: (dokumen: DokumenDesaAntiKorupsiView) => void };

/** Daftar dokumen ringkas: ikon tipe, judul, aksi Pratinjau (khusus PDF) & Unduh. */
export function DokumenRingkasList({ items, onPreview }: Props) {
  return (
    <Paper withBorder radius="lg" p={0} bg="white">
      <Stack gap={0} component="ul" m={0} p={0} style={{ listStyle: 'none' }}>
        {items.map(({ dokumen: d, folderLabel }, index) => {
          const pdf = isPdfMime(d.file.mimeType);
          const ext = fileExtension(d.file.realName, d.file.mimeType);
          const Icon = (pdf ? IconFileTypePdf : ICON_BY_EXT[ext]) ?? IconFileText;
          return (
            <Group
              key={d.id}
              component="li"
              data-dokumen-id={d.id}
              gap="sm"
              wrap="nowrap"
              justify="space-between"
              px="md"
              py="sm"
              style={index > 0 ? { borderTop: '1px solid var(--mantine-color-gray-2)' } : undefined}
            >
              <Group gap="sm" wrap="nowrap" miw={0}>
                <Icon size={24} color={colors['blue-button']} style={{ flexShrink: 0 }} />
                <Stack gap={2} miw={0}>
                  <Text fz="sm" fw={500} lineClamp={2} title={d.judul}>
                    {d.judul}
                  </Text>
                  <Group gap={6}>
                    <Badge size="xs" variant="light" color="gray">
                      {ext}
                    </Badge>
                    {folderLabel && (
                      <Text fz="xs" c="dimmed" truncate>
                        {folderLabel}
                      </Text>
                    )}
                  </Group>
                </Stack>
              </Group>
              <Group gap={6} wrap="nowrap">
                {pdf && (
                  <Tooltip label="Pratinjau" withArrow>
                    <ActionIcon
                      variant="light"
                      color={colors['blue-button']}
                      radius="xl"
                      size="lg"
                      aria-label={`Pratinjau ${d.judul}`}
                      onClick={() => onPreview(d)}
                    >
                      <IconEye size={18} />
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
                    size="lg"
                    aria-label={`Unduh ${d.judul}`}
                  >
                    <IconDownload size={18} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            </Group>
          );
        })}
      </Stack>
    </Paper>
  );
}
