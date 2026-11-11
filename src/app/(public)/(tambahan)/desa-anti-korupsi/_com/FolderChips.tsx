import colors from '@/con/colors';
import type { FolderGroupView } from '@/lib/desa-anti-korupsi-view';
import { Button, Text } from '@mantine/core';
import Link from 'next/link';
import { programHref } from '../_lib/program-folder';
import type { UrutValue } from '../_lib/program-urut';
import classes from './program-folder.module.css';
import { FOLDER_BRAND_VARS } from './program-folder.style';

type Props = { programId: string; groups: readonly FolderGroupView[]; activeKey: string; urut: UrutValue };

/** Baris chip semua folder (nama + jumlah) untuk pindah folder tanpa kembali ke grid; chip aktif di-highlight. */
export function FolderChips({ programId, groups, activeKey, urut }: Props) {
  return (
    <nav aria-label="Pilih folder" className={classes.chips} style={FOLDER_BRAND_VARS} data-testid="folder-chips">
      {groups.map((g) => {
        const aktif = g.key === activeKey;
        return (
          <Button
            key={g.key}
            component={Link}
            href={programHref(programId, g.key, urut)}
            scroll={false}
            className={classes.chip}
            data-folder-chip={g.key}
            data-active={aktif}
            aria-current={aktif ? 'page' : undefined}
            variant={aktif ? 'filled' : 'default'}
            color={colors['blue-button']}
            radius="xl"
            size="xs"
            rightSection={
              <Text span fz={11} fw={600} opacity={aktif ? 0.9 : 0.6}>
                {g.dokumen.length}
              </Text>
            }
            styles={{ label: { maxWidth: 220 } }}
          >
            <Text span fz="xs" fw={aktif ? 600 : 500} truncate>
              {g.nama}
            </Text>
          </Button>
        );
      })}
    </nav>
  );
}
