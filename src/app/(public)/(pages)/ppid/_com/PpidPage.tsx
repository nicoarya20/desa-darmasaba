import { DetailBackLink } from '@/app/(public)/_com/detail-back-link/DetailBackLink';
import { Box, Stack, VisuallyHidden } from '@mantine/core';
import type { ComponentProps, CSSProperties, ReactNode } from 'react';
import BackButton from '../../pemerintahan/layanan/_com/BackButto';
import { PpidHeader } from './PpidHeader';

/**
 * Lebar "baca/formulir" halaman PPID (1200px): batas isi teks dan formulir.
 * Tabel, grafik, dan bagan tidak memakainya — mereka selebar kerangka.
 */
const PPID_MEASURE = '75rem';

/** Variabel yang dibaca CSS module halaman PPID: warna brand (token, ikut tema) dan lebar baca (`--ppid-measure`). */
const PPID_VARS = { '--brand': 'var(--c-brand)', '--ppid-measure': PPID_MEASURE } as CSSProperties;

type Props = {
  title: string;
  lead: string;
  /** Diteruskan ke slot kanan `PpidHeader`. */
  aside?: ReactNode;
  /** Kepala halaman hanya untuk pembaca layar — untuk halaman yang judul tampaknya ada di dalam isi (Visi Misi). */
  headerHidden?: boolean;
  /** Variabel CSS tambahan milik halaman (mis. gradasi kartu Struktur PPID). */
  style?: CSSProperties;
  /**
   * Halaman detail: tautan teks "‹ Nama Daftar" ke daftarnya, menggantikan tombol ikon panah
   * (yang tetap dipakai halaman daftar/menu PPID).
   */
  backLink?: ComponentProps<typeof DetailBackLink>;
  children: ReactNode;
};

/** Kerangka halaman publik PPID: latar, jarak tepi, tombol/tautan kembali, kepala halaman, lalu isi. */
export function PpidPage({ title, lead, aside, headerHidden, style, backLink, children }: Props) {
  const header = <PpidHeader title={title} lead={lead} aside={aside} />;
  return (
    <Stack bg="var(--c-bg)" py="xl" gap={48} mih="100vh" style={{ ...PPID_VARS, ...style }}>
      <Box px={{ base: 'md', md: 100 }}>
        {backLink ? <DetailBackLink href={backLink.href} label={backLink.label} /> : <BackButton />}
      </Box>
      <Stack px={{ base: 'md', md: 100 }} gap={40}>
        {headerHidden ? <VisuallyHidden component="div">{header}</VisuallyHidden> : header}
        {children}
      </Stack>
    </Stack>
  );
}
