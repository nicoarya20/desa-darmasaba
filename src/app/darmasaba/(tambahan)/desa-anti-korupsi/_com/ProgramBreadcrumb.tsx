import colors from '@/con/colors';
import { Anchor, Breadcrumbs, Text } from '@mantine/core';
import Link from 'next/link';
import { toSentenceCase } from '@/app/darmasaba/_com/main-page/desaantikorupsi/desaantikorupsi.logic';
import { detailHref } from '../_lib/kategori-tab';
import { programHref } from '../_lib/program-folder';
import { judulProgram } from '../_lib/program-judul';

type Props = { programId: string; programName: string; kategori?: string | null; folderName?: string | null };

const ROOT_HREF = '/darmasaba/desa-anti-korupsi';

/** Breadcrumb: Desa Anti Korupsi › kategori › program › folder (teks sentence case; item terakhir bukan tautan). */
export function ProgramBreadcrumb({ programId, programName, kategori, folderName }: Props) {
  const crumbs = [
    { label: 'Desa Anti Korupsi', href: ROOT_HREF },
    ...(kategori ? [{ label: toSentenceCase(kategori), href: detailHref(kategori) }] : []),
    { label: judulProgram(programName).lengkap, href: folderName ? programHref(programId) : null },
    ...(folderName ? [{ label: toSentenceCase(folderName), href: null }] : []),
  ];
  return (
    <Breadcrumbs separator="›" separatorMargin={6} style={{ flexWrap: 'wrap', rowGap: 4 }}>
      {crumbs.map((c, i) =>
        c.href ? (
          <Anchor key={i} component={Link} href={c.href} fz="sm" c={colors['blue-button']} lineClamp={1} maw={260} title={c.label}>
            {c.label}
          </Anchor>
        ) : (
          <Text key={i} fz="sm" c="dimmed" lineClamp={1} maw={260} title={c.label} aria-current="page">
            {c.label}
          </Text>
        ),
      )}
    </Breadcrumbs>
  );
}
