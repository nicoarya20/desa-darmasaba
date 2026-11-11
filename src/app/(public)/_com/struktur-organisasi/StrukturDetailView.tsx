import BackButton from '@/app/(public)/(pages)/pemerintahan/layanan/_com/BackButto';
import colors from '@/con/colors';
import { Avatar, Box, Divider, Group, Image, Paper, Stack, Text, Title } from '@mantine/core';
import type { ReactNode } from 'react';
import { detailRows, displayName, initialsOf, type StrukturDetailData } from './struktur-person.logic';
import { STRUKTUR_DETAIL_TEXT as T } from './struktur.text';

const AVATAR_SIZE = 160;
const avatarBorder = { border: `2px solid ${colors['blue-button']}` };

/** Kerangka halaman profil: tombol kembali lalu kartu putih terpusat. */
export function StrukturDetailFrame({ children }: { children: ReactNode }) {
  return (
    <Box px={{ base: 'md', md: 100 }} py="xl">
      <Group mb="lg">
        <BackButton />
      </Group>
      <Paper w={{ base: '100%', md: '70%' }} mx="auto" p="xl" radius="lg" shadow="sm" bg="white" style={{ border: '1px solid #eaeaea' }}>
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
        fit="cover" fallbackSrc="/default-avatar.svg" style={avatarBorder} loading="lazy" />
    );
  }
  return (
    <Avatar size={AVATAR_SIZE} radius={AVATAR_SIZE} color={colors['blue-button']} variant="light" style={avatarBorder}
      aria-hidden data-initials>
      <Text component="span" fz={48} fw={700} c={colors['blue-button']}>{initialsOf(data.namaLengkap)}</Text>
    </Avatar>
  );
}

type Props = { data: StrukturDetailData; /** Judul blok info (mis. "Informasi Pegawai"). */ infoTitle: string };

/** Profil pegawai: foto/inisial, nama + gelar, jabatan, lalu baris info yang terisi saja + status. */
export function StrukturDetailView({ data, infoTitle }: Props) {
  return (
    <StrukturDetailFrame>
      <Stack align="center" gap="md">
        <DetailPhoto data={data} />
        <Stack align="center" gap={4}>
          <Title order={1} c={colors['blue-button']} fw={700} fz={{ base: 'xl', md: '28px' }} lh={1.2} ta="center">
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
            <InfoRow key={row.key} label={row.label} multiline={row.multiline}>{row.value}</InfoRow>
          ))}
          <InfoRow label={T.status} color={data.isActive ? 'green' : 'red'}>
            {data.isActive ? T.aktif : T.tidakAktif}
          </InfoRow>
        </dl>
      </Stack>
    </StrukturDetailFrame>
  );
}

type RowProps = { label: string; children: ReactNode; color?: string; multiline?: boolean };

function InfoRow({ label, children, color, multiline }: RowProps) {
  return (
    <div>
      <Text component="dt" fz={{ base: 'sm', md: 'md' }} fw={600} lh={1.3} c="dark">{label}</Text>
      <Text component="dd" m={0} fz={{ base: 'sm', md: 'md' }} lh={1.5} c={color ?? 'dimmed'}
        style={{ whiteSpace: multiline ? 'pre-line' : 'normal', overflowWrap: 'anywhere' }}>
        {children}
      </Text>
    </div>
  );
}
