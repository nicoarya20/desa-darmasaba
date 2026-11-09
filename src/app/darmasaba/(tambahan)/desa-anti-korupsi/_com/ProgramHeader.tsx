import colors from '@/con/colors';
import type { DesaAntiKorupsiDetail } from '@/lib/desa-anti-korupsi-view';
import { Box, Button, Group, Stack, Text, Title } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import Link from 'next/link';
import { detailHref } from '../_lib/kategori-tab';
import { ZIP_HINT } from '../_lib/program-zip';
import { ProgramBreadcrumb } from './ProgramBreadcrumb';
import { UnduhZipButton } from './UnduhZipButton';

type Props = { detail: DesaAntiKorupsiDetail; folderName: string | null; jumlahDokumen: number };

/** Kepala halaman program: Kembali, breadcrumb, judul + deskripsi, dan "Unduh semua (ZIP)" + petunjuk batas. */
export function ProgramHeader({ detail, folderName, jumlahDokumen }: Props) {
  const kategori = detail.kategori?.name ?? null;
  return (
    <>
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
      <ProgramBreadcrumb programId={detail.id} programName={detail.name} kategori={kategori} folderName={folderName} />
      <Group justify="space-between" align="flex-start" gap="md">
        <Stack gap={6} miw={0} style={{ flex: '1 1 320px' }}>
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
        <Stack gap={4} align="flex-start">
          <UnduhZipButton programId={detail.id} folder={null} label="Unduh semua (ZIP)" disabled={jumlahDokumen === 0} />
          <Text fz="xs" c="dimmed" data-testid="zip-hint">
            {ZIP_HINT}
          </Text>
        </Stack>
      </Group>
    </>
  );
}
