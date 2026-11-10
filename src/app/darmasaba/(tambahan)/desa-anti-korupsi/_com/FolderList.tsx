import colors from '@/con/colors';
import { formatUkuran } from '@/lib/desa-anti-korupsi-sort';
import type { FolderGroupView } from '@/lib/desa-anti-korupsi-view';
import { Badge, Text } from '@mantine/core';
import { IconChevronRight, IconFolder } from '@tabler/icons-react';
import Link from 'next/link';
import { cuplikanJudul, tanggalTerakhir } from '../_lib/folder-kartu';
import { programHref, totalUkuranFolder } from '../_lib/program-folder';
import type { UrutValue } from '../_lib/program-urut';
import classes from './program-folder.module.css';

type Props = { programId: string; groups: readonly FolderGroupView[]; urut: UrutValue };

/** Daftar folder program (termasuk "Umum") dalam panel baris: jumlah · ukuran · tanggal, cuplikan judul; tautan `?folder=`. */
export function FolderList({ programId, groups, urut }: Props) {
  return (
    <ul className={classes.panel} aria-label="Folder dokumen">
      {groups.map((g) => {
        const total = totalUkuranFolder(g.dokumen);
        const kosong = g.dokumen.length === 0;
        const tanggal = tanggalTerakhir(g.dokumen);
        const cuplikan = cuplikanJudul(g.dokumen);
        return (
          <li key={g.key}>
            <Link
              href={programHref(programId, g.key, urut)}
              scroll={false}
              className={classes.baris}
              data-folder-key={g.key}
              data-kosong={kosong}
            >
              <span className={classes.ikon} aria-hidden>
                <IconFolder size={24} stroke={1.6} />
              </span>
              <span className={classes.isi}>
                <Text span fw={600} fz="md" lh={1.35} lineClamp={1} title={g.nama} c={colors['blue-button-7']}>
                  {g.nama}
                </Text>
                <Text span fz="xs" c="dimmed">
                  <span data-testid="jumlah-dokumen-folder">{g.dokumen.length} dokumen</span>
                  {/* Total hanya bila semua ukuran berkas diketahui (berkas lama bisa belum punya size). */}
                  {total !== null && <span data-testid="ukuran-folder"> · {formatUkuran(total)}</span>}
                  {tanggal && <span data-testid="tanggal-folder"> · Diperbarui {tanggal}</span>}
                </Text>
                {cuplikan.judul.length > 0 && (
                  <Text span fz="xs" c="gray.7" lineClamp={1} data-testid="cuplikan-folder" title={cuplikan.judul.join(', ')}>
                    {cuplikan.judul.join(' · ')}
                    {cuplikan.sisa > 0 && ' '}
                    {cuplikan.sisa > 0 && (
                      <Text span fz="xs" c={colors['blue-button']} fw={500} data-testid="cuplikan-sisa">
                        +{cuplikan.sisa} lainnya
                      </Text>
                    )}
                  </Text>
                )}
              </span>
              <span className={classes.ujung}>
                {kosong && (
                  <Badge variant="light" color="gray" radius="xl" size="sm" data-testid="badge-kosong">
                    Kosong
                  </Badge>
                )}
                <IconChevronRight size={20} aria-hidden />
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
