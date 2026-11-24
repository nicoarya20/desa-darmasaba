import { DetailBackLink } from '@/app/(public)/_com/detail-back-link/DetailBackLink';
import colors from '@/con/colors';
import { Avatar, Box, Divider, Group, Image, Paper, Stack, Text, Title } from '@mantine/core';
import type { ComponentProps, ReactNode } from 'react';
import s from './struktur-detail.module.css';
import { detailRows, displayName, initialsOf, type StrukturDetailData } from './struktur-person.logic';
import { STRUKTUR_DETAIL_TEXT as T } from './struktur.text';

const AVATAR_SIZE = 160;

/** Tujuan + teks tautan kembali; tiap konsumen (PPID, Perangkat Desa) memberi daftarnya sendiri. */
export type StrukturDetailBack = ComponentProps<typeof DetailBackLink>;

/** Kerangka halaman profil: latar halaman, tautan kembali ke daftar, lalu kartu ubin terpusat. */
export function StrukturDetailFrame({ back, children }: { back: StrukturDetailBack; children: ReactNode }) {
  return (
    <Box px={{ base: 'md', md: 100 }} py="xl" className={s.page}>
      <Group mb="lg">
        <DetailBackLink href={back.href} label={back.label} />
      </Group>
      <Paper w={{ base: '100%', md: '70%' }} mx="auto" p="xl" radius="lg" className={s.paper}>
        {children}
      </Paper>
    </Box>
  );
}

/** Foto profil; tanpa foto → avatar inisial nama. */
function DetailPhoto({ data }: { data: StrukturDetailData }) {
  const link = data.image?.link;
  if (link) {
    return (
      <Image src={link} alt={T.photoAlt(data.namaLengkap)} w={AVATAR_SIZE} h={AVATAR_SIZE} radius={AVATAR_SIZE}
        fit="cover" fallbackSrc="/default-avatar.svg" className={s.ring} loading="lazy" />
    );
  }
  return (
    <Avatar size={AVATAR_SIZE} radius={AVATAR_SIZE} color={colors['blue-button']} variant="light" className={s.ring}
      aria-hidden data-initials>
      <Text component="span" fz={48} fw={700} c="var(--c-brand)">{initialsOf(data.namaLengkap)}</Text>
    </Avatar>
  );
}

type Props = {
  data: StrukturDetailData;
  /** Judul blok info (mis. "Informasi Pegawai"). */
  infoTitle: string;
  back: StrukturDetailBack;
};

/** Profil pegawai: foto/inisial, nama + gelar, jabatan, lalu baris info yang terisi saja + status. */
export function StrukturDetailView({ data, infoTitle, back }: Props) {
  return (
    <StrukturDetailFrame back={back}>
      <Stack align="center" gap="md">
        <DetailPhoto data={data} />
        <Stack align="center" gap={4}>
          <Title order={1} c="var(--c-brand)" fw={700} fz={{ base: 'xl', md: '28px' }} lh={1.2} ta="center">
            {displayName(data)}
          </Title>
          {data.posisi?.nama ? (
            <Text fz={{ base: 'sm', md: 'md' }} lh={1.4} c="dimmed" ta="center">{data.posisi.nama}</Text>
          ) : null}
        </Stack>
      </Stack>
      <Divider my="lg" />
      <Stack gap="md" component="section" aria-label={infoTitle}>
        <Title order={2} fz={{ base: 'lg', md: 'xl' }} lh={1.3}>{infoTitle}</Title>
        <dl style={{ margin: 0, display: 'grid', gap: 'var(--mantine-spacing-md)' }}>
          {detailRows(data).map((row) => (
            <InfoRow key={row.key} label={row.label}>{row.value}</InfoRow>
          ))}
          <InfoRow label={T.status} color={data.isActive ? 'green' : 'red'}>
            {data.isActive ? T.aktif : T.tidakAktif}
          </InfoRow>
        </dl>
      </Stack>
    </StrukturDetailFrame>
  );
}

type RowProps = { label: string; children: ReactNode; color?: string };

function InfoRow({ label, children, color }: RowProps) {
  return (
    <div>
      <Text component="dt" fz={{ base: 'sm', md: 'md' }} fw={600} lh={1.3} className={s.label}>{label}</Text>
      <Text component="dd" m={0} fz={{ base: 'sm', md: 'md' }} lh={1.5} c={color ?? 'dimmed'}
        style={{ overflowWrap: 'anywhere' }}>
        {children}
      </Text>
    </div>
  );
}
