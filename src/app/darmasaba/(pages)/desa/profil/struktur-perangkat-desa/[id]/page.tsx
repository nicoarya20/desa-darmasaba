'use client';
import stateStrukturPPID from '@/app/admin/(dashboard)/_state/ppid/struktur_ppid/struktur_PPID';
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
import { useParams } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import BackButton from '../../_com/BackButto';

function DetailPegawaiUser() {
  const statePegawai = useProxy(stateStrukturPPID.pegawai);
  const params = useParams();

  useShallowEffect(() => {
    stateStrukturPPID.posisiOrganisasi.findMany.load();
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
        <BackButton />
      </Group>

      <Paper
        w={{ base: '100%', md: '70%' }}
        mx="auto"
        p="xl"
        radius="lg"
        shadow="sm"
        bg="white"
        style={{
          border: '1px solid #eaeaea',
        }}
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
          <Stack align="center" gap={4}>
            {/* Title utama → H2 karena ini judul profil */}
            <Title order={2} c={colors['blue-button']} lh={1.2}>
              {data.namaLengkap || '-'} {data.gelarAkademik || ''}
            </Title>

            <Text
              fz={{ base: 'sm', md: 'md' }}
              lh={1.4}
              c="dimmed"
            >
              {data.posisi?.nama || 'Posisi tidak tersedia'}
            </Text>
          </Stack>
        </Stack>

        <Divider my="lg" />

        {/* Informasi Detail */}
        <Stack gap="lg">
          <Title order={3} lh={1.3}>
            Informasi Pegawai
          </Title>

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

/* Komponen kecil untuk menampilkan baris informasi */
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
        lh={1.3}
        c="dark"
      >
        {label}
      </Text>

      <Text
        fz={{ base: 'sm', md: 'md' }}
        lh={1.5}
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

export default DetailPegawaiUser;
