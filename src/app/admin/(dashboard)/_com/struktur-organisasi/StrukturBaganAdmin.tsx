import { StrukturChart } from '@/app/(public)/_com/struktur-organisasi/StrukturChart';
import type { OrgNode } from '@/app/(public)/_com/struktur-organisasi/struktur.logic';
import { STRUKTUR_VARS } from '@/app/(public)/_com/struktur-organisasi/struktur.meta';
import colors from '@/con/colors';
import { Center, Text } from '@mantine/core';
import type { CSSProperties } from 'react';
import { STRUKTUR_ADMIN_TEXT as T } from './struktur-admin.text';

/** Variabel CSS bagan publik + `--brand` (di publik disediakan kerangka halaman PPID). */
const BAGAN_VARS = { ...STRUKTUR_VARS, '--brand': colors['blue-button'] } as CSSProperties;

type Props = {
  roots: readonly OrgNode[];
  /** Nama bagan untuk pembaca layar. */
  label: string;
  /** Rute detail pegawai admin yang dituju kartu. */
  hrefFor: (pegawaiId: string) => string;
};

/** Bagan struktur di admin: komponen bagan publik, kartu menuju detail pegawai admin. */
export function StrukturBaganAdmin({ roots, label, hrefFor }: Props) {
  if (roots.length === 0) {
    return (
      <Center py="xl">
        <Text c="dimmed">{T.bagan.kosong}</Text>
      </Center>
    );
  }
  return (
    <div style={BAGAN_VARS}>
      <StrukturChart roots={roots} label={label} hrefFor={hrefFor} />
    </div>
  );
}
