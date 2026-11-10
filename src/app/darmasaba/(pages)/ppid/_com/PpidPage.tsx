import colors from '@/con/colors';
import { Box, Stack } from '@mantine/core';
import type { CSSProperties, ReactNode } from 'react';
import BackButton from '../../pemerintahan/layanan/_com/BackButto';
import { PpidHeader } from './PpidHeader';

/** Variabel warna yang dibaca CSS module halaman PPID. */
const PPID_VARS = { '--brand': colors['blue-button'] } as CSSProperties;

type Props = {
  title: string;
  lead: string;
  /** Diteruskan ke slot kanan `PpidHeader`. */
  aside?: ReactNode;
  /** Variabel CSS tambahan milik halaman (mis. gradasi kartu Struktur PPID). */
  style?: CSSProperties;
  children: ReactNode;
};

/** Kerangka halaman publik PPID: latar, jarak tepi, tombol kembali, kepala halaman, lalu isi. */
export function PpidPage({ title, lead, aside, style, children }: Props) {
  return (
    <Stack bg={colors.Bg} py="xl" gap={48} mih="100vh" style={{ ...PPID_VARS, ...style }}>
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>
      <Stack px={{ base: 'md', md: 100 }} gap={40}>
        <PpidHeader title={title} lead={lead} aside={aside} />
        {children}
      </Stack>
    </Stack>
  );
}
