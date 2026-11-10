import colors from '@/con/colors';
import type { DesaAntiKorupsiDetail } from '@/lib/desa-anti-korupsi-view';
import { ActionIcon, Badge, Box } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import Link from 'next/link';
import type { TujuanKembali } from '../_lib/program-folder';
import { isDeskripsiDuplikat, judulProgram } from '../_lib/program-judul';
import { ProgramBreadcrumb } from './ProgramBreadcrumb';
import classes from './program-folder.module.css';

type Props = {
  detail: DesaAntiKorupsiDetail;
  /** Nama folder yang dibuka lewat `?folder=` (untuk breadcrumb); null di tingkat program. */
  folderName: string | null;
  /** Tujuan + label tombol kembali (lihat `tujuanKembali`). */
  kembali: TujuanKembali;
};

/** Kepala halaman program: tombol kembali (kotak ikon, tujuan pasti), breadcrumb, nomor + judul sentence case, deskripsi. */
export function ProgramHeader({ detail, folderName, kembali }: Props) {
  const kategori = detail.kategori?.name ?? null;
  const { nomor, judul } = judulProgram(detail.name);
  // Data desa sering mengisi deskripsi = nama program persis; ulangan itu tidak ditampilkan.
  const tampilDeskripsi = Boolean(detail.deskripsi) && !isDeskripsiDuplikat(detail.deskripsi, detail.name);
  return (
    <>
      {/* Senada BackButton halaman detail, tapi berupa tautan: history.back() bisa keluar dari alur folder. */}
      <ActionIcon
        component={Link}
        href={kembali.href}
        bg={colors['blue-button']}
        aria-label={kembali.label}
        title={kembali.label}
        data-testid="program-kembali"
      >
        <IconArrowLeft aria-hidden />
      </ActionIcon>
      <header className={classes.kepala}>
        <ProgramBreadcrumb programId={detail.id} programName={detail.name} kategori={kategori} folderName={folderName} />
        {nomor && (
          <Badge
            variant="light"
            color={colors['blue-button']}
            radius="xl"
            size="lg"
            style={{ fontVariantNumeric: 'tabular-nums' }}
            data-testid="nomor-program"
          >
            {nomor}
          </Badge>
        )}
        <h1 className={classes.judul}>{judul}</h1>
        {tampilDeskripsi && (
          <Box
            className={classes.deskripsi}
            data-testid="deskripsi-program"
            dangerouslySetInnerHTML={{ __html: detail.deskripsi }}
          />
        )}
      </header>
    </>
  );
}
