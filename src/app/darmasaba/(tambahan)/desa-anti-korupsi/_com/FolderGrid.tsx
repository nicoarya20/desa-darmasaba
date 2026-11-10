import colors from '@/con/colors';
import { formatUkuran } from '@/lib/desa-anti-korupsi-sort';
import type { FolderGroupView } from '@/lib/desa-anti-korupsi-view';
import { Badge, Group, Paper, SimpleGrid, Stack, Text } from '@mantine/core';
import { IconCalendar, IconFolder } from '@tabler/icons-react';
import Link from 'next/link';
import { cuplikanJudul, tanggalTerakhir } from '../_lib/folder-kartu';
import { programHref, totalUkuranFolder } from '../_lib/program-folder';
import type { UrutValue } from '../_lib/program-urut';
import classes from './program-folder.module.css';
import { FOLDER_BRAND_VARS } from './program-folder.style';

type Props = { programId: string; groups: readonly FolderGroupView[]; urut: UrutValue };

/** Grid kartu folder program (termasuk "Umum"): jumlah · ukuran, tanggal terbaru, cuplikan judul; tautan `?folder=` (urut ikut). */
export function FolderGrid({ programId, groups, urut }: Props) {
  return (
    <SimpleGrid cols={{ base: 1, xs: 2, md: 3 }} spacing="md" style={FOLDER_BRAND_VARS}>
      {groups.map((g) => {
        const total = totalUkuranFolder(g.dokumen);
        const kosong = g.dokumen.length === 0;
        const tanggal = tanggalTerakhir(g.dokumen);
        const cuplikan = cuplikanJudul(g.dokumen);
        return (
          <Paper
            key={g.key}
            component={Link}
            href={programHref(programId, g.key, urut)}
            scroll={false}
            data-folder-key={g.key}
            data-kosong={kosong}
            className={classes.kartu}
            withBorder
            radius="lg"
            p="md"
            shadow="xs"
            bg="white"
          >
            <Group justify="space-between" align="flex-start" wrap="nowrap" gap="xs">
              <span className={classes.ikon} aria-hidden>
                <IconFolder size={24} stroke={1.6} />
              </span>
              {kosong && (
                <Badge variant="light" color="gray" radius="xl" size="sm" data-testid="badge-kosong">
                  Kosong
                </Badge>
              )}
            </Group>
            <Stack gap={2} miw={0}>
              <Text fw={600} fz="md" lh={1.35} lineClamp={2} title={g.nama} c={colors['blue-button-7']}>
                {g.nama}
              </Text>
              <Group gap={4}>
                <Text fz="xs" c="dimmed" data-testid="jumlah-dokumen-folder">
                  {g.dokumen.length} dokumen
                </Text>
                {/* Total hanya bila semua ukuran berkas diketahui (berkas lama bisa belum punya size). */}
                {total !== null && (
                  <Text fz="xs" c="dimmed" data-testid="ukuran-folder">
                    · {formatUkuran(total)}
                  </Text>
                )}
              </Group>
            </Stack>
            {cuplikan.judul.length > 0 && (
              <Stack gap={2} miw={0} data-testid="cuplikan-folder">
                {cuplikan.judul.map((judul, i) => (
                  <Text key={i} fz="xs" c="gray.7" lineClamp={1} title={judul}>
                    • {judul}
                  </Text>
                ))}
                {cuplikan.sisa > 0 && (
                  <Text fz="xs" c={colors['blue-button']} fw={500} data-testid="cuplikan-sisa">
                    +{cuplikan.sisa} lainnya
                  </Text>
                )}
              </Stack>
            )}
            {tanggal && (
              <Group gap={4} mt="auto" c="dimmed" wrap="nowrap" data-testid="tanggal-folder">
                <IconCalendar size={14} aria-hidden />
                <Text fz="xs" c="dimmed">
                  Diperbarui {tanggal}
                </Text>
              </Group>
            )}
          </Paper>
        );
      })}
    </SimpleGrid>
  );
}
