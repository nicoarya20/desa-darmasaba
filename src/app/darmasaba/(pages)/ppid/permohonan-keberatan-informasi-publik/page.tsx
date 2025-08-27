'use client'
import permohonanKeberatanInformasi from '@/app/admin/(dashboard)/_state/ppid/permohonan_keberatan_informasi_publik/permohonanKeberatanInformasi';
import { PPIDTextEditor } from '@/app/admin/(dashboard)/ppid/_com/PPIDTextEditor';
import colors from '@/con/colors';
import {
  Box,
  Button,
  Center,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Tooltip,
} from '@mantine/core';
import {
  IconFileCheck,
  IconForms,
  IconHourglassOff,
  IconPhoneRinging,
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import BackButton from '../../desa/layanan/_com/BackButto';

const data = [
  {
    id: 1,
    icon: IconForms,
    title: 'Isi Formulir',
    desc: 'Lengkapi formulir keberatan secara online dengan mudah.',
  },
  {
    id: 2,
    icon: IconFileCheck,
    title: 'Verifikasi Data',
    desc: 'Tim PPID akan memeriksa dan memverifikasi permohonan Anda.',
  },
  {
    id: 3,
    icon: IconHourglassOff,
    title: 'Proses Keberatan',
    desc: 'Keberatan diproses maksimal dalam 30 hari kerja.',
  },
  {
    id: 4,
    icon: IconPhoneRinging,
    title: 'Hasil Dikirim',
    desc: 'Hasil keputusan dikirim melalui email atau WhatsApp.',
  },
];

function Page() {
  const stateKeberatan = useProxy(permohonanKeberatanInformasi);
  const router = useRouter();

  const submit = () => {
    if (
      stateKeberatan.create.form.name &&
      stateKeberatan.create.form.email &&
      stateKeberatan.create.form.notelp &&
      stateKeberatan.create.form.alasan
    ) {
      stateKeberatan.create.create();
      router.push('/darmasaba/permohonan/berhasil');
    } else {
      console.log('Formulir belum lengkap');
    }
  };

  return (
    <Stack bg={colors.Bg} py="xl" gap={40}>
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>

      <Stack align="center" px={{ base: 'md', md: 100 }}>
        <Text
          ta="center"
          fz={{ base: '2rem', md: '2.8rem' }}
          c={colors['blue-button']}
          fw={800}
          style={{ letterSpacing: '-0.5px' }}
        >
          Permohonan Keberatan Informasi Publik
        </Text>

        <Paper
          p="xl"
          radius="xl"
          bg={colors['white-trans-1']}
          shadow="sm"
          withBorder
        >
          <Stack gap="xl">
            <Box>
              <Text fw={700} fz={{ base: 'lg', md: 'xl' }} mb={8}>
                Tentang Permohonan Keberatan
              </Text>
              <Text ta="justify" fz={{ base: 'sm', md: 'md' }} lh={1.6}>
                Jika Anda merasa permohonan informasi tidak ditanggapi dengan
                baik atau ditolak, Anda berhak mengajukan keberatan melalui
                formulir berikut.
              </Text>
            </Box>

            <Stack>
              <Text
                ta="center"
                fw={700}
                fz={{ base: 'xl', md: '2xl' }}
                style={{ letterSpacing: '-0.5px' }}
              >
                Alur Pengajuan Keberatan
              </Text>

              <SimpleGrid cols={{ base: 1, md: 4 }} spacing="lg">
                {data.map((v) => (
                  <Paper
                    key={v.id}
                    p="lg"
                    radius="lg"
                    bg={colors['blue-button']}
                    shadow="md"
                  >
                    <Stack align="center" gap="sm">
                      <Center>
                        <v.icon size={48} color={colors['white-1']} />
                      </Center>
                      <Text
                        ta="center"
                        c={colors['white-1']}
                        fw={700}
                        fz="lg"
                      >
                        {v.title}
                      </Text>
                      <Text ta="center" c={colors['white-1']} fz="sm">
                        {v.desc}
                      </Text>
                    </Stack>
                  </Paper>
                ))}
              </SimpleGrid>
            </Stack>

            <Group justify="center">
              <Paper
                p="xl"
                radius="xl"
                bg={colors['white-1']}
                shadow="md"
                withBorder
                maw={600}
                w="100%"
              >
                <Stack gap="md">
                  <Text
                    fw={700}
                    fz={{ base: 'lg', md: 'xl' }}
                    ta="center"
                    mb={4}
                  >
                    Formulir Keberatan
                  </Text>

                  <TextInput
                    label="Nama Lengkap"
                    placeholder="Tulis nama lengkap Anda"
                    radius="md"
                    size="md"
                    withAsterisk
                    onChange={(val) =>
                      (stateKeberatan.create.form.name = val.target.value)
                    }
                  />

                  <TextInput
                    label="Alamat Email"
                    placeholder="contoh: nama@email.com"
                    radius="md"
                    size="md"
                    type="email"
                    withAsterisk
                    onChange={(val) =>
                      (stateKeberatan.create.form.email = val.target.value)
                    }
                  />

                  <TextInput
                    label="Nomor Telepon"
                    placeholder="contoh: 0812-3456-7890"
                    radius="md"
                    size="md"
                    withAsterisk
                    onChange={(val) =>
                      (stateKeberatan.create.form.notelp = val.target.value)
                    }
                  />

                  <Box>
                    <Text fw={600} fz="sm" mb={6}>
                      Alasan Keberatan
                    </Text>
                    <PPIDTextEditor
                      showSubmit={false}
                      onChange={(val) =>
                        (stateKeberatan.create.form.alasan = val)
                      }
                    />
                  </Box>

                  <Tooltip label="Pastikan semua data sudah diisi dengan benar">
                    <Button
                      onClick={submit}
                      size="md"
                      radius="md"
                      fw={600}
                      bg={colors['blue-button']}
                    >
                      Kirim Permohonan
                    </Button>
                  </Tooltip>
                </Stack>
              </Paper>
            </Group>

            <Stack gap={4} pt="lg" align="center">
              <Text fw={700} fz="lg">
                Kontak PPID
              </Text>
              <Text fz="sm" c="dimmed">
                Email: desadarmasaba@badungkab.go.id | WhatsApp: 081-xxx-xxx-xxx
              </Text>
            </Stack>
          </Stack>
        </Paper>
      </Stack>
    </Stack>
  );
}

export default Page;
