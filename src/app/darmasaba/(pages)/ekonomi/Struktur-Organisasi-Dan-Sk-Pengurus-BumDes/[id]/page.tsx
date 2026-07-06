'use client';
import stateStrukturBumDes from '@/app/admin/(dashboard)/_state/ekonomi/struktur-organisasi/struktur-organisasi';
import colors from '@/con/colors';
import {
  Box,
  Divider,
  Group,
  Image,
  Paper,
  Skeleton,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';

function DetailPegawaiBumdes() {
  const statePegawai = useProxy(stateStrukturBumDes.pegawai);
  const params = useParams();
  const router = useRouter();

  useShallowEffect(() => {
    stateStrukturBumDes.posisiOrganisasi.findMany.load();
    statePegawai.findUnique.load(params?.id as string);
  }, []);

  if (!statePegawai.findUnique.data) {
    return (
      <Stack py="lg">
        <Skeleton height={500} radius="md" />
      </Stack>
    );
  }

  const data = statePegawai.findUnique.data;

  return (
    <Box px={{ base: 'md', md: 100 }} py="xl">
      {/* Back button */}
      <Group mb="lg" px={{ base: 'md', md: 100 }}>
        <Box
          onClick={() => router.back()}
          style={{
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <IconArrowBack size={22} color={colors['blue-button']} />
          <Text fz={{ base: 'sm', md: 'md' }} lh="1.4" fw={500} c={colors['blue-button']}>
            Kembali
          </Text>
        </Box>
      </Group>

      <Paper
        w={{ base: '100%', md: '70%' }}
        mx="auto"
        p="xl"
        radius="lg"
        shadow="sm"
        bg="white"
        style={{ border: '1px solid #eaeaea' }}
      >
        <Stack align="center" gap="md">
          {/* Foto Profil */}
          <Image
            src={data.image?.link || '/default-avatar.svg'}
            alt={data.namaLengkap || 'Foto Profil'}
            w={160}
            h={160}
            radius={100}
            fit="cover"
            fallbackSrc="/default-avatar.svg"
            style={{ border: `2px solid ${colors['blue-button']}` }}
            loading="lazy"
          />

          {/* Nama & Jabatan */}
          <Stack align="center" gap={2}>
            <Title
              order={2}
              c={colors['blue-button']}
              fw={700}
              fz={{ base: 'xl', md: '28px' }}
              lh="1.2"
              ta="center"
            >
              {data.namaLengkap || '-'} {data.gelarAkademik || ''}
            </Title>

            <Text
              fz={{ base: 'sm', md: 'md' }}
              lh="1.4"
              c="dimmed"
              ta="center"
            >
              {data.posisi?.nama || 'Posisi tidak tersedia'}
            </Text>
          </Stack>
        </Stack>

        <Divider my="lg" />

        {/* Informasi Detail */}
        <Stack gap="md">
          <InfoRow label="Email" value={data.email} />
          <InfoRow label="Telepon" value={data.telepon} />
          <InfoRow label="Alamat" value={data.alamat} multiline />
          <InfoRow
            label="Tanggal Masuk"
            value={
              data.tanggalMasuk
                ? new Date(data.tanggalMasuk).toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })
                : '-'
            }
          />
          <InfoRow
            label="Status"
            value={data.isActive ? 'Aktif' : 'Tidak Aktif'}
            valueColor={data.isActive ? 'green' : 'red'}
          />
        </Stack>
      </Paper>
    </Box>
  );
}

/* Komponen Baris Informasi */
function InfoRow({
  label,
  value,
  valueColor,
  multiline = false,
}: {
  label: string;
  value?: string | null;
  valueColor?: string;
  multiline?: boolean;
}) {
  return (
    <Box>
      <Text
        fz={{ base: 'sm', md: 'md' }}
        fw={600}
        lh="1.3"
        c="dark"
      >
        {label}
      </Text>

      <Text
        fz={{ base: 'sm', md: 'md' }}
        lh="1.5"
        c={valueColor || 'dimmed'}
        style={{
          whiteSpace: multiline ? 'normal' : 'nowrap',
          wordBreak: 'break-word',
        }}
      >
        {value || '-'}
      </Text>
    </Box>
  );
}

export default DetailPegawaiBumdes;
