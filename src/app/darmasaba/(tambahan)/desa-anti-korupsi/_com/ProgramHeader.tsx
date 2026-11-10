import colors from '@/con/colors';
import type { DesaAntiKorupsiDetail } from '@/lib/desa-anti-korupsi-view';
import { Badge, Box, Button, Group, Stack, Text, Title } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import Link from 'next/link';
import { detailHref } from '../_lib/kategori-tab';
import { isDeskripsiDuplikat, judulProgram } from '../_lib/program-judul';
import { ZIP_HINT } from '../_lib/program-zip';
import { ProgramBreadcrumb } from './ProgramBreadcrumb';
import { UnduhZipButton } from './UnduhZipButton';

type Props = { detail: DesaAntiKorupsiDetail; folderName: string | null; jumlahDokumen: number };

/** Kepala halaman program: Kembali, breadcrumb, nomor + judul sentence case, deskripsi (bila bukan ulangan judul), unduh ZIP. */
export function ProgramHeader({ detail, folderName, jumlahDokumen }: Props) {
  const kategori = detail.kategori?.name ?? null;
  const { nomor, judul } = judulProgram(detail.name);
  // Data desa sering mengisi deskripsi = nama program persis; ulangan itu tidak ditampilkan.
  const tampilDeskripsi = Boolean(detail.deskripsi) && !isDeskripsiDuplikat(detail.deskripsi, detail.name);
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
        <Stack gap={8} miw={0} style={{ flex: '1 1 320px' }}>
          {nomor && (
            <Badge
              variant="light"
              color={colors['blue-button']}
              radius="xl"
              size="lg"
              w="fit-content"
              style={{ fontVariantNumeric: 'tabular-nums' }}
              data-testid="nomor-program"
            >
              {nomor}
            </Badge>
          )}
          <Title
            order={1}
            fz={{ base: 20, md: 26 }}
            fw={700}
            lh={1.35}
            c={colors['blue-button']}
            maw={820}
            style={{ wordBreak: 'break-word', textWrap: 'pretty' }}
          >
            {judul}
          </Title>
          {tampilDeskripsi && (
            <Box
              fz="sm"
              c="dimmed"
              style={{ wordBreak: 'break-word', lineHeight: 1.6 }}
              data-testid="deskripsi-program"
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
