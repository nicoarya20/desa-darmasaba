'use client';
import { fileExtension, isPdfMime, type DokumenDesaAntiKorupsiView } from '@/lib/desa-anti-korupsi-dokumen';
import { formatUkuran } from '@/lib/desa-anti-korupsi-sort';
import { folderGroups, type DesaAntiKorupsiDetail } from '@/lib/desa-anti-korupsi-view';
import { Accordion, ActionIcon, Badge, Box, Group, Stack, Table, Text, Tooltip } from '@mantine/core';
import { IconDownload, IconEye, IconFolder } from '@tabler/icons-react';
import { useState } from 'react';
import { DETAIL_SORT_DEFAULT, detailGroups, formatTanggalId, type DetailSortValue } from '../_lib/detail-view';
import { DokumenPreviewDialog, type DokumenPreviewSource } from './DokumenPreviewDialog';
import { DokumenToolbarCariUrut } from './DokumenToolbarCariUrut';
import { DokumenZipButton } from './DokumenZipButton';

type Props = Pick<DesaAntiKorupsiDetail, 'folders' | 'dokumenUmum'> & { programId: string };

function DokumenTable({ dokumen, onPreview }: { dokumen: readonly DokumenDesaAntiKorupsiView[]; onPreview: (d: DokumenPreviewSource) => void }) {
  if (dokumen.length === 0) {
    return (
      <Text fz="sm" c="dimmed">
        Folder ini belum berisi dokumen
      </Text>
    );
  }
  return (
    <Table.ScrollContainer minWidth={600}>
      <Table striped highlightOnHover verticalSpacing={6}>
        <Table.Thead>
          <Table.Tr>
            <Table.Th w={48}>No</Table.Th>
            <Table.Th>Judul</Table.Th>
            <Table.Th w={80}>Tipe</Table.Th>
            <Table.Th w={96}>Ukuran</Table.Th>
            <Table.Th w={112}>Diunggah</Table.Th>
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
                  <Text fz="sm" data-testid="ukuran-dokumen">{formatUkuran(d.file.size)}</Text>
                </Table.Td>
                <Table.Td>
                  <Text fz="sm" data-testid="tanggal-dokumen">{formatTanggalId(d.createdAt)}</Text>
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

/**
 * Detail admin: dokumen program sebagai tabel ringkas per folder dalam Accordion + pratinjau modal,
 * dengan cari/urut tampilan (tidak mengubah urutan tersimpan) dan unduh ZIP per folder.
 */
export function DokumenFolderView({ folders, dokumenUmum, programId }: Props) {
  const groups = folderGroups({ folders, dokumenUmum });
  const [preview, setPreview] = useState<DokumenPreviewSource | null>(null);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<DetailSortValue>(DETAIL_SORT_DEFAULT);
  const firstFilled = groups.find((g) => g.dokumen.length > 0)?.key;
  const [opened, setOpened] = useState<string[]>(firstFilled ? [firstFilled] : []);

  if (groups.length === 0) {
    return (
      <Text fz="sm" c="dimmed">
        Tidak ada dokumen tersedia
      </Text>
    );
  }

  const view = detailGroups(groups, query, sort);
  const jumlahAsli = new Map(groups.map((g) => [g.key, g.dokumen.length]));

  const handleQuery = (q: string) => {
    setQuery(q);
    // Saat mencari, buka semua folder yang berisi hasil supaya hasil langsung terlihat.
    if (q.trim()) setOpened(detailGroups(groups, q, sort).groups.map((g) => g.key));
  };

  return (
    <Stack gap="sm">
      <DokumenToolbarCariUrut
        query={query}
        onQueryChange={handleQuery}
        sort={sort}
        onSortChange={setSort}
        total={view.total}
        searching={view.searching}
      />
      {view.groups.length === 0 ? (
        <Text fz="sm" c="dimmed" data-testid="cari-kosong">
          Tidak ada dokumen yang cocok dengan &quot;{query.trim()}&quot;
        </Text>
      ) : (
        <Accordion multiple variant="separated" radius="md" value={opened} onChange={setOpened}>
          {view.groups.map((g) => {
            const jumlah = jumlahAsli.get(g.key) ?? 0;
            return (
              <Accordion.Item key={g.key} value={g.key} data-folder-key={g.key}>
                <Group gap={0} wrap="nowrap" pr="xs">
                  <Box style={{ flex: 1, minWidth: 0 }}>
                    <Accordion.Control icon={<IconFolder size={18} />}>
                      <Group gap="xs" wrap="nowrap">
                        <Text fw={600} fz="sm" truncate>
                          {g.nama}
                        </Text>
                        <Badge variant="light" size="sm" data-testid="jumlah-dokumen-folder">
                          {view.searching ? `${g.dokumen.length}/${jumlah}` : jumlah}
                        </Badge>
                      </Group>
                    </Accordion.Control>
                  </Box>
                  <DokumenZipButton programId={programId} folder={g.key} target={g.nama} disabled={jumlah === 0} />
                </Group>
                <Accordion.Panel>
                  <DokumenTable dokumen={g.dokumen} onPreview={setPreview} />
                </Accordion.Panel>
              </Accordion.Item>
            );
          })}
        </Accordion>
      )}
      <DokumenPreviewDialog preview={preview} onClose={() => setPreview(null)} />
    </Stack>
  );
}
