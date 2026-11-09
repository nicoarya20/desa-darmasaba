'use client';
import colors from '@/con/colors';
import type { DokumenDesaAntiKorupsiView } from '@/lib/desa-anti-korupsi-dokumen';
import { folderGroups, type DesaAntiKorupsiDetail } from '@/lib/desa-anti-korupsi-view';
import { Box, Button, Flex, Group, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowLeft, IconFolderOpen, IconInbox, IconSearch } from '@tabler/icons-react';
import Link from 'next/link';
import { useState, type ReactNode } from 'react';
import { detailHref } from '../_lib/kategori-tab';
import { programHref, resolveActiveFolder, searchDokumen } from '../_lib/program-folder';
import { DokumenPreviewModal } from './DokumenPreviewModal';
import { DokumenRingkasList } from './DokumenRingkasList';
import { FolderGrid } from './FolderGrid';
import { ProgramBreadcrumb } from './ProgramBreadcrumb';

type Props = { detail: DesaAntiKorupsiDetail; folderParam: string | null };

function EmptyState({ children }: { children: ReactNode }) {
  return (
    <Flex direction="column" align="center" justify="center" gap="sm" py="xl" data-testid="empty-state">
      <IconInbox size={48} stroke={1.5} color={colors['blue-button']} />
      <Text fz="md" fw={500} c="dimmed" ta="center">
        {children}
      </Text>
    </Flex>
  );
}

/** Isi halaman program publik: breadcrumb, deskripsi, cari dokumen, grid folder atau daftar dokumen folder aktif. */
export function ProgramIsi({ detail, folderParam }: Props) {
  const [query, setQuery] = useState('');
  const [preview, setPreview] = useState<DokumenDesaAntiKorupsiView | null>(null);
  const groups = folderGroups(detail);
  const active = resolveActiveFolder(folderParam, groups);
  const kategori = detail.kategori?.name ?? null;
  const searching = query.trim() !== '';
  const hasil = searchDokumen(groups, query);

  let content: ReactNode;
  if (groups.length === 0) {
    content = <EmptyState>Belum ada dokumen pada program ini</EmptyState>;
  } else if (searching) {
    content =
      hasil.length === 0 ? (
        <EmptyState>Dokumen dengan judul &quot;{query.trim()}&quot; tidak ditemukan</EmptyState>
      ) : (
        <DokumenRingkasList
          items={hasil.map((h) => ({ dokumen: h.dokumen, folderLabel: h.folder.nama }))}
          onPreview={setPreview}
        />
      );
  } else if (active) {
    content = (
      <Stack gap="sm">
        <Group justify="space-between" wrap="nowrap">
          <Group gap="xs" wrap="nowrap" miw={0}>
            <IconFolderOpen size={22} color={colors['blue-button']} style={{ flexShrink: 0 }} />
            <Text fw={600} truncate data-testid="folder-aktif">
              {active.nama}
            </Text>
            <Text fz="sm" c="dimmed" style={{ flexShrink: 0 }}>
              ({active.dokumen.length} dokumen)
            </Text>
          </Group>
          <Button component={Link} href={programHref(detail.id)} scroll={false} variant="subtle" size="xs">
            Semua folder
          </Button>
        </Group>
        {active.dokumen.length === 0 ? (
          <EmptyState>Folder ini belum berisi dokumen</EmptyState>
        ) : (
          <DokumenRingkasList items={active.dokumen.map((dokumen) => ({ dokumen }))} onPreview={setPreview} />
        )}
      </Stack>
    );
  } else {
    content = <FolderGrid programId={detail.id} groups={groups} />;
  }

  return (
    <Stack gap="lg">
      <Group justify="space-between" gap="xs">
        <Button
          component={Link}
          href={kategori ? detailHref(kategori) : '/darmasaba/desa-anti-korupsi'}
          variant="subtle"
          color={colors['blue-button']}
          leftSection={<IconArrowLeft size={18} />}
          px={4}
        >
          Kembali
        </Button>
      </Group>
      <ProgramBreadcrumb
        programId={detail.id}
        programName={detail.name}
        kategori={kategori}
        folderName={searching ? null : active?.nama}
      />
      <Stack gap={6}>
        <Title order={1} fz={{ base: 24, md: 32 }} c={colors['blue-button']} style={{ wordBreak: 'break-word' }}>
          {detail.name}
        </Title>
        {detail.deskripsi && (
          <Box
            fz="sm"
            c="dimmed"
            style={{ wordBreak: 'break-word', lineHeight: 1.6 }}
            dangerouslySetInnerHTML={{ __html: detail.deskripsi }}
          />
        )}
      </Stack>
      {groups.length > 0 && (
        <TextInput
          placeholder="Cari judul dokumen di semua folder"
          aria-label="Cari judul dokumen"
          leftSection={<IconSearch size={16} />}
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
          radius="xl"
          maw={480}
        />
      )}
      {content}
      <DokumenPreviewModal dokumen={preview} onClose={() => setPreview(null)} />
    </Stack>
  );
}
