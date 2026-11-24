import { DetailBackLink } from '@/app/(public)/_com/detail-back-link/DetailBackLink';
import rt from '@/app/(public)/_com/rich-text/rich-text.module.css';
import type { DesaAntiKorupsiDetail } from '@/lib/desa-anti-korupsi-view';
import { Badge, Box } from '@mantine/core';
import type { TujuanKembali } from '../_lib/program-folder';
import { isDeskripsiDuplikat, judulProgram } from '../_lib/program-judul';
import { ProgramBreadcrumb } from './ProgramBreadcrumb';
import classes from './program-folder.module.css';

type Props = {
  detail: DesaAntiKorupsiDetail;
  /** Nama folder yang dibuka lewat `?folder=` (untuk breadcrumb); null di tingkat program. */
  folderName: string | null;
  /** Tujuan + teks tautan kembali (lihat `tujuanKembali`). */
  kembali: TujuanKembali;
};

/** Kepala halaman program: tautan kembali teks (tujuan pasti), breadcrumb, nomor + judul sentence case, deskripsi. */
export function ProgramHeader({ detail, folderName, kembali }: Props) {
  const kategori = detail.kategori?.name ?? null;
  const { nomor, judul } = judulProgram(detail.name);
  // Data desa sering mengisi deskripsi = nama program persis; ulangan itu tidak ditampilkan.
  const tampilDeskripsi = Boolean(detail.deskripsi) && !isDeskripsiDuplikat(detail.deskripsi, detail.name);
  return (
    <>
      {/* Tautan ke daftar asal, bukan history.back(): riwayat bisa keluar dari alur folder. */}
      <DetailBackLink href={kembali.href} label={kembali.label} />
      <header className={classes.kepala}>
        <ProgramBreadcrumb programId={detail.id} programName={detail.name} kategori={kategori} folderName={folderName} />
        {nomor && (
          <Badge
            variant="light"
            color="var(--c-brand)"
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
            className={`${classes.deskripsi} ${rt.root}`}
            data-testid="deskripsi-program"
            dangerouslySetInnerHTML={{ __html: detail.deskripsi }}
          />
        )}
      </header>
    </>
  );
}
