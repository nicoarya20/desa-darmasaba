import colors from '@/con/colors';
import { Anchor, Breadcrumbs, Text } from '@mantine/core';
import Link from 'next/link';
import { detailHref } from '../_lib/kategori-tab';
import { programHref } from '../_lib/program-folder';

type Props = { programId: string; programName: string; kategori?: string | null; folderName?: string | null };

const ROOT_HREF = '/darmasaba/desa-anti-korupsi';

/** Breadcrumb: Desa Anti Korupsi › kategori › program › folder (item terakhir bukan tautan). */
export function ProgramBreadcrumb({ programId, programName, kategori, folderName }: Props) {
  const crumbs = [
    { label: 'Desa Anti Korupsi', href: ROOT_HREF },
    ...(kategori ? [{ label: kategori, href: detailHref(kategori) }] : []),
    { label: programName, href: folderName ? programHref(programId) : null },
    ...(folderName ? [{ label: folderName, href: null }] : []),
  ];
  return (
    <Breadcrumbs separator="›" separatorMargin={6} style={{ flexWrap: 'wrap', rowGap: 4 }}>
      {crumbs.map((c, i) =>
        c.href ? (
          <Anchor key={i} component={Link} href={c.href} fz="sm" c={colors['blue-button']} lineClamp={1} maw={260}>
            {c.label}
          </Anchor>
        ) : (
          <Text key={i} fz="sm" c="dimmed" lineClamp={1} maw={260} aria-current="page">
            {c.label}
          </Text>
        ),
      )}
    </Breadcrumbs>
  );
}
