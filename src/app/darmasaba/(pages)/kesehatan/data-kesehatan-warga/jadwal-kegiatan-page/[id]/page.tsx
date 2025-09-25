'use client'
import jadwalkegiatanState from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/jadwalKegiatan';
import BackButton from '@/app/darmasaba/(pages)/desa/layanan/_com/BackButto';
import colors from '@/con/colors';
import {
  Box,
  Divider,
  Group,
  Paper,
  Skeleton,
  Stack,
  Text
} from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconMail, IconPhone, IconUser } from '@tabler/icons-react';
import { useParams } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import CreatePendaftaran from '../create/page';


function Page() {
  const params = useParams();
  const state = useProxy(jadwalkegiatanState);

  useShallowEffect(() => {
    state.findUnique.load(params?.id as string);
  }, []);



  if (!state.findUnique.data) {
    return (
      <Stack py="xl" px="lg">
        <Skeleton h={500} radius="lg" />
      </Stack>
    );
  }

  return (
    <Stack pos="relative" bg={colors.Bg} py="xl" gap="lg">
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>
      <Box px={{ base: "md", md: 100 }}>
        <Stack gap="lg">
          <Paper radius="xl" shadow="md">
            <Box
              style={{ borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
              bg={colors['blue-button']}
            >
              <Text p="md" fz={{ base: "h3", md: "h2" }} c={colors['white-1']} fw="bold">
                Detail & Pendaftaran Kegiatan
              </Text>
            </Box>
            <Box p="lg">
              <Stack gap="xl">
                <Stack gap="sm">
                  <Text fz="lg" fw="bold">Informasi Kegiatan</Text>
                  <Divider />
                  <Text fz="md" fw="bold">Nama Kegiatan: <Text span>{state.findUnique.data.informasijadwalkegiatan.name}</Text></Text>
                  <Text fz="md" fw="bold">Tanggal: <Text span>{state.findUnique.data.informasijadwalkegiatan.tanggal}</Text></Text>
                  <Text fz="md" fw="bold">Waktu: <Text span>{state.findUnique.data.informasijadwalkegiatan.waktu}</Text></Text>
                  <Text fz="md" fw="bold">Lokasi: <Text span>{state.findUnique.data.informasijadwalkegiatan.lokasi}</Text></Text>
                </Stack>

                <Stack gap="sm">
                  <Text fz="lg" fw="bold">Deskripsi Kegiatan</Text>
                  <Divider />
                  <Text ta="justify" fz="md" dangerouslySetInnerHTML={{ __html: state.findUnique.data.deskripsijadwalkegiatan.deskripsi }} />
                </Stack>

                <Stack gap="sm">
                  <Text fz="lg" fw="bold">Layanan yang Tersedia</Text>
                  <Divider />
                  <Text ta="justify" fz="md" dangerouslySetInnerHTML={{ __html: state.findUnique.data.layananjadwalkegiatan.content }} />
                </Stack>

                <Stack gap="sm">
                  <Text fz="lg" fw="bold">Syarat & Ketentuan</Text>
                  <Divider />
                  <Text ta="justify" fz="md" dangerouslySetInnerHTML={{ __html: state.findUnique.data.syaratketentuanjadwalkegiatan.content }} />
                </Stack>

                <Stack gap="sm">
                  <Text fz="lg" fw="bold">Dokumen yang Perlu Dibawa</Text>
                  <Divider />
                  <Text ta="justify" fz="md" dangerouslySetInnerHTML={{ __html: state.findUnique.data.dokumenjadwalkegiatan.content }} />
                </Stack>

                <CreatePendaftaran />

                <Paper p="lg" radius="md" bg={colors['blue-button-trans']} shadow="sm">
                  <Stack gap="xs">
                    <Text fz="lg" c={colors['white-1']} fw="bold">Informasi Kontak</Text>
                    <Group gap="xs">
                      <IconUser size={18} color="white" />
                      <Text fz="md" c={colors['white-1']}>Penanggung Jawab: <Text span fw="bold">Bidan Komang Ayu</Text></Text>
                    </Group>
                    <Group gap="xs">
                      <IconPhone size={18} color="white" />
                      <Text fz="md" c={colors['white-1']}>081234567890</Text>
                    </Group>
                    <Group gap="xs">
                      <IconMail size={18} color="white" />
                      <Text fz="md" c={colors['white-1']}>puskesmasabiansemal3@gmail.com</Text>
                    </Group>
                  </Stack>
                </Paper>
              </Stack>
            </Box>
          </Paper>
        </Stack>
      </Box>
    </Stack>
  );
}

export default Page;
