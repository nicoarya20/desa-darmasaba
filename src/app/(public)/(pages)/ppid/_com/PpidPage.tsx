import colors from '@/con/colors';
import { Box, Stack, VisuallyHidden } from '@mantine/core';
import type { CSSProperties, ReactNode } from 'react';
import BackButton from '../../pemerintahan/layanan/_com/BackButto';
import { PpidHeader } from './PpidHeader';

/**
 * Lebar "baca/formulir" halaman PPID (1200px): batas isi teks dan formulir.
 * Tabel, grafik, dan bagan tidak memakainya — mereka selebar kerangka.
 */
const PPID_MEASURE = '75rem';

/** Variabel yang dibaca CSS module halaman PPID: warna brand dan lebar baca (`--ppid-measure`). */
const PPID_VARS = { '--brand': colors['blue-button'], '--ppid-measure': PPID_MEASURE } as CSSProperties;

type Props = {
  title: string;
  lead: string;
  /** Diteruskan ke slot kanan `PpidHeader`. */
  aside?: ReactNode;
  /** Kepala halaman hanya untuk pembaca layar — untuk halaman yang judul tampaknya ada di dalam isi (Visi Misi). */
  headerHidden?: boolean;
  /** Variabel CSS tambahan milik halaman (mis. gradasi kartu Struktur PPID). */
  style?: CSSProperties;
  children: ReactNode;
};

/** Kerangka halaman publik PPID: latar, jarak tepi, tombol kembali, kepala halaman, lalu isi. */
export function PpidPage({ title, lead, aside, headerHidden, style, children }: Props) {
  const header = <PpidHeader title={title} lead={lead} aside={aside} />;
  return (
    <Stack bg={colors.Bg} py="xl" gap={48} mih="100vh" style={{ ...PPID_VARS, ...style }}>
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>
      <Stack px={{ base: 'md', md: 100 }} gap={40}>
        {headerHidden ? <VisuallyHidden component="div">{header}</VisuallyHidden> : header}
        {children}
      </Stack>
    </Stack>
  );
}
