'use client';
import { fileExtension, isPdfMime, type DokumenDesaAntiKorupsiView } from '@/lib/desa-anti-korupsi-dokumen';
import { folderGroups, type DesaAntiKorupsiDetail } from '@/lib/desa-anti-korupsi-view';
import { Accordion, ActionIcon, Badge, Group, Table, Text, Tooltip } from '@mantine/core';
import { IconDownload, IconEye, IconFolder } from '@tabler/icons-react';
import { useState } from 'react';
import { DokumenPreviewDialog, type DokumenPreviewSource } from './DokumenPreviewDialog';

type Props = Pick<DesaAntiKorupsiDetail, 'folders' | 'dokumenUmum'>;

function DokumenTable({ dokumen, onPreview }: { dokumen: readonly DokumenDesaAntiKorupsiView[]; onPreview: (d: DokumenPreviewSource) => void }) {
  if (dokumen.length === 0) {
    return (
      <Text fz="sm" c="dimmed">
        Folder ini belum berisi dokumen
      </Text>
    );
  }
  return (
    <Table.ScrollContainer minWidth={420}>
      <Table striped highlightOnHover verticalSpacing={6}>
        <Table.Thead>
          <Table.Tr>
            <Table.Th w={48}>No</Table.Th>
            <Table.Th>Judul</Table.Th>
            <Table.Th w={80}>Tipe</Table.Th>
            <Table.Th w={96}>Aksi</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {dokumen.map((d, index) => {
            const pdf = isPdfMime(d.file.mimeType);
            return (
              <Table.Tr key={d.id} data-dokumen-id={d.id}>
                <Table.Td>{index + 1}</Table.Td>
                <Table.Td>
                  <Text fz="sm" lineClamp={2} title={d.judul}>
                    {d.judul}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Badge variant="light" size="sm">
                    {fileExtension(d.file.realName, d.file.mimeType)}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Group gap={4} wrap="nowrap">
                    <Tooltip label={pdf ? 'Pratinjau' : 'Pratinjau hanya untuk PDF'}>
                      <ActionIcon
                        variant="light"
                        aria-label={`Pratinjau ${d.judul}`}
                        disabled={!pdf}
                        onClick={() => onPreview({ src: d.file.link, title: d.judul })}
                      >
                        <IconEye size={16} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Unduh">
                      <ActionIcon
                        component="a"
                        href={d.file.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="light"
                        aria-label={`Unduh ${d.judul}`}
                      >
                        <IconDownload size={16} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}

/** Detail admin: dokumen program sebagai tabel ringkas per folder dalam Accordion + pratinjau modal. */
export function DokumenFolderView({ folders, dokumenUmum }: Props) {
  const groups = folderGroups({ folders, dokumenUmum });
  const [preview, setPreview] = useState<DokumenPreviewSource | null>(null);
  const firstFilled = groups.find((g) => g.dokumen.length > 0)?.key;

  if (groups.length === 0) {
    return (
      <Text fz="sm" c="dimmed">
        Tidak ada dokumen tersedia
      </Text>
    );
  }

  return (
    <>
      <Accordion multiple variant="separated" radius="md" defaultValue={firstFilled ? [firstFilled] : []}>
        {groups.map((g) => (
          <Accordion.Item key={g.key} value={g.key} data-folder-key={g.key}>
            <Accordion.Control icon={<IconFolder size={18} />}>
              <Group gap="xs" wrap="nowrap">
                <Text fw={600} fz="sm" truncate>
                  {g.nama}
                </Text>
                <Badge variant="light" size="sm" data-testid="jumlah-dokumen-folder">
                  {g.dokumen.length}
                </Badge>
              </Group>
            </Accordion.Control>
            <Accordion.Panel>
              <DokumenTable dokumen={g.dokumen} onPreview={setPreview} />
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>
      <DokumenPreviewDialog preview={preview} onClose={() => setPreview(null)} />
    </>
  );
}
