import colors from '@/con/colors';
import { formatUkuran } from '@/lib/desa-anti-korupsi-sort';
import type { FolderGroupView } from '@/lib/desa-anti-korupsi-view';
import { Group, Paper, SimpleGrid, Stack, Text } from '@mantine/core';
import { IconFolder } from '@tabler/icons-react';
import Link from 'next/link';
import { programHref, totalUkuranFolder } from '../_lib/program-folder';
import type { UrutValue } from '../_lib/program-urut';

type Props = { programId: string; groups: readonly FolderGroupView[]; urut: UrutValue };

/** Grid folder program (termasuk "Umum"); tiap folder tautan `?folder=` (urut ikut) + jumlah & total ukuran. */
export function FolderGrid({ programId, groups, urut }: Props) {
  return (
    <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing="md">
      {groups.map((g) => {
        const total = totalUkuranFolder(g.dokumen);
        return (
          <Paper
            key={g.key}
            component={Link}
            href={programHref(programId, g.key, urut)}
            scroll={false}
            data-folder-key={g.key}
            withBorder
            radius="lg"
            p="md"
            shadow="xs"
            bg="white"
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <Stack gap={6} h="100%">
              <IconFolder size={36} color={colors['blue-button']} stroke={1.5} />
              <Text fw={600} fz="sm" lineClamp={2} title={g.nama} c={colors['blue-button-7']}>
                {g.nama}
              </Text>
              <Group gap={4} mt="auto">
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
          </Paper>
        );
      })}
    </SimpleGrid>
  );
}
