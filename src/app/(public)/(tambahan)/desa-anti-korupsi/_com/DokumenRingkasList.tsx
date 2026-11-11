import colors from '@/con/colors';
import { isPdfMime, type DokumenDesaAntiKorupsiView } from '@/lib/desa-anti-korupsi-dokumen';
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
import { dokumenInfo, ringkasInfo } from '../_lib/dokumen-info';

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

/** Daftar dokumen ringkas: ikon tipe, judul, tipe/ukuran/tanggal unggah, aksi Pratinjau (khusus PDF) & Unduh. */
export function DokumenRingkasList({ items, onPreview }: Props) {
  return (
    // Panel senada daftar indikator halaman detail: #f5f5f7, radius 18px, tanpa border.
    <Paper radius={18} p={0} bg="#f5f5f7">
      <Stack gap={0} component="ul" m={0} p={0} style={{ listStyle: 'none' }}>
        {items.map(({ dokumen: d, folderLabel }, index) => {
          const pdf = isPdfMime(d.file.mimeType);
          const info = dokumenInfo(d);
          const Icon = (pdf ? IconFileTypePdf : ICON_BY_EXT[info.tipe]) ?? IconFileText;
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
              style={index > 0 ? { borderTop: '1px solid rgba(0, 0, 0, 0.08)' } : undefined}
            >
              <Group gap="sm" wrap="nowrap" miw={0} style={{ flex: 1 }}>
                <Icon size={24} color={colors['blue-button']} style={{ flexShrink: 0 }} />
                <Stack gap={2} miw={0}>
                  <Text fz="sm" fw={500} lineClamp={2} title={d.judul}>
                    {d.judul}
                  </Text>
                  {/* Mobile: tipe · ukuran · tanggal turun jadi satu baris keterangan kecil di bawah judul. */}
                  <Text fz="xs" c="dimmed" hiddenFrom="sm" data-testid="dokumen-info-ringkas">
                    {ringkasInfo(info)}
                  </Text>
                  {folderLabel && (
                    <Text fz="xs" c="dimmed" truncate>
                      {folderLabel}
                    </Text>
                  )}
                </Stack>
              </Group>
              <Group gap="md" wrap="nowrap" visibleFrom="sm" data-testid="dokumen-info" style={{ flexShrink: 0 }}>
                <Badge size="sm" variant="light" color="gray" w={64} title="Tipe berkas">
                  {info.tipe}
                </Badge>
                <Text fz="xs" c="dimmed" w={72} ta="right" title="Ukuran berkas">
                  {info.ukuran}
                </Text>
                <Text fz="xs" c="dimmed" w={96} title="Tanggal unggah">
                  {info.tanggal}
                </Text>
              </Group>
              <Group gap={6} wrap="nowrap" style={{ flexShrink: 0 }}>
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
