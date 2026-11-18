'use client'
import jadwalkegiatanState from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/jadwalKegiatan';
import t from '@/app/(public)/(pages)/kesehatan/_com/kesehatan-tema.module.css';
import rt from '@/app/(public)/_com/rich-text/rich-text.module.css';
import BackButton from '@/app/(public)/(pages)/pemerintahan/layanan/_com/BackButto';
import {
  Box,
  Button,
  Divider,
  Group,
  Modal,
  Paper,
  Skeleton,
  Stack,
  Text,
  Title
} from '@mantine/core';
import { useDisclosure, useShallowEffect } from '@mantine/hooks';
import { IconMail, IconPhone, IconUser } from '@tabler/icons-react';
import { useParams } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import CreatePendaftaran from '../create/page';


function Page() {
  const params = useParams();
  const state = useProxy(jadwalkegiatanState);
  const [opened, { open, close }] = useDisclosure(false);

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
    <Stack pos="relative" className={t.tema} bg="var(--c-hero-bg)" py="xl" gap="lg">
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>
      <Box px={{ base: "md", md: 100 }}>
        <Stack gap="lg">
          <Paper radius="xl" shadow="md">
            <Box
              style={{ borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
              bg="var(--c-brand-fill)"
            >
              <Title
                p="md"
                order={1}
                c="var(--kt-on-fill)"
                fw="bold"
                ta={{ base: 'center', md: 'left' }}
              >
                Detail & Pendaftaran Kegiatan
              </Title>
            </Box>
            <Box p="lg">
              <Stack gap="xl">
                <Stack gap="sm">
                  <Title order={2} fw="bold">Informasi Kegiatan</Title>
                  <Divider />
                  <Text fw="bold">
                    Nama Kegiatan:&nbsp;
                    <Text span fw="normal">
                      {state.findUnique.data.informasijadwalkegiatan.name}
                    </Text>
                  </Text>
                  <Text fw="bold">
                    Tanggal:&nbsp;
                    <Text span fw="normal">
                      {state.findUnique.data.informasijadwalkegiatan.tanggal}
                    </Text>
                  </Text>
                  <Text fw="bold">
                    Waktu:&nbsp;
                    <Text span fw="normal">
                      {state.findUnique.data.informasijadwalkegiatan.waktu}
                    </Text>
                  </Text>
                  <Text fw="bold">
                    Lokasi:&nbsp;
                    <Text span fw="normal">
                      {state.findUnique.data.informasijadwalkegiatan.lokasi}
                    </Text>
                  </Text>
                </Stack>

                <Stack gap="sm">
                  <Title order={2} fw="bold">Deskripsi Kegiatan</Title>
                  <Divider />
                  <Box pl={20}>
                    <Text
                      ta="justify"
                      style={{ wordBreak: "break-word", whiteSpace: "normal" }}
                      className={rt.root} dangerouslySetInnerHTML={{ __html: state.findUnique.data.deskripsijadwalkegiatan.deskripsi }}
                    />
                  </Box>
                </Stack>

                <Stack gap="sm">
                  <Title order={2} fw="bold">Layanan yang Tersedia</Title>
                  <Divider />
                  <Box pl={20}>
                    <Text
                      ta="justify"
                      style={{ wordBreak: "break-word", whiteSpace: "normal" }}
                      className={rt.root} dangerouslySetInnerHTML={{ __html: state.findUnique.data.layananjadwalkegiatan.content }}
                    />
                  </Box>
                </Stack>

                <Stack gap="sm">
                  <Title order={2} fw="bold">Syarat & Ketentuan</Title>
                  <Divider />
                  <Box pl={20}>
                    <Text
                      ta="justify"
                      style={{ wordBreak: "break-word", whiteSpace: "normal" }}
                      className={rt.root} dangerouslySetInnerHTML={{ __html: state.findUnique.data.syaratketentuanjadwalkegiatan.content }}
                    />
                  </Box>
                </Stack>

                <Stack gap="sm">
                  <Title order={2} fw="bold">Dokumen yang Perlu Dibawa</Title>
                  <Divider />
                  <Box pl={20}>
                    <Text
                      ta="justify"
                      style={{ wordBreak: "break-word", whiteSpace: "normal" }}
                      className={rt.root} dangerouslySetInnerHTML={{ __html: state.findUnique.data.dokumenjadwalkegiatan.content }}
                    />
                  </Box>
                </Stack>

                <Stack gap="sm">
                  <Title order={2} fw="bold">Pendaftaran Kegiatan</Title>
                  <Divider />
                  <Group>
                    <Button onClick={open}>Buat Pendaftaran</Button>
                  </Group>
                </Stack>

                <Modal opened={opened} onClose={close}>
                  <CreatePendaftaran />
                </Modal>

                <Paper p="lg" radius="md" bg="var(--kt-info)" shadow="sm">
                  <Stack gap="xs">
                    <Title order={3} c="var(--kt-on-fill)" fw="bold">Informasi Kontak</Title>
                    <Group gap="xs" justify="flex-start">
                      <IconUser size={18} color="white" />
                      <Text c="var(--kt-on-fill)">
                        Penanggung Jawab:&nbsp;
                        <Text span fw="bold" c="var(--kt-on-fill)">Bidan Komang Ayu</Text>
                      </Text>
                    </Group>
                    <Group gap="xs">
                      <IconPhone size={18} color="white" />
                      <Text c="var(--kt-on-fill)">081234567890</Text>
                    </Group>
                    <Group gap="xs">
                      <IconMail size={18} color="white" />
                      <Text c="var(--kt-on-fill)">puskesmasabiansemal3@gmail.com</Text>
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