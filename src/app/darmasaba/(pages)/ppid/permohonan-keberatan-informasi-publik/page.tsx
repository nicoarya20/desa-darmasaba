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
  Title,
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

  // Helper function to validate email format
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Check if form is valid
  const isFormValid = () => {
    const form = stateKeberatan.create.form;
    return (
      form.name?.trim() !== '' &&
      form.email?.trim() !== '' &&
      isValidEmail(form.email) &&
      form.notelp?.trim() !== '' &&
      form.alasan?.trim() !== ''
    );
  };

  const submit = async () => {
    const hasil = await stateKeberatan.create.create();
    if (hasil) router.push('/darmasaba/permohonan/berhasil');
  };

  return (
    <Stack bg={colors.Bg} py="xl" gap={40}>
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>

      <Stack align="center" px={{ base: 'md', md: 100 }}>
        <Title
          order={1}
          ta="center"
          fz={{ base: '1.8rem', md: '2.6rem' }}
          lh={1.2}
          c={colors['blue-button']}
          style={{ letterSpacing: -0.5 }}
        >
          Permohonan Keberatan Informasi Publik
        </Title>

        <Paper
          p="xl"
          radius="xl"
          bg={colors['white-trans-1']}
          shadow="sm"
          withBorder
        >
          <Stack gap="xl">
            {/* Tentang */}
            <Box>
              <Title order={3} fz={{ base: 'lg', md: 'xl' }} lh={1.3} mb={8}>
                Tentang Permohonan Keberatan
              </Title>

              <Text
                ta="justify"
                fz={{ base: 'sm', md: 'md' }}
                lh={1.7}
                c="black"
              >
                Jika Anda merasa permohonan informasi tidak ditanggapi dengan
                baik atau ditolak, Anda berhak mengajukan keberatan melalui
                formulir berikut.
              </Text>
            </Box>

            {/* Alur */}
            <Stack>
              <Title
                order={3}
                ta="center"
                fw={700}
                fz={{ base: 'xl', md: '2xl' }}
                lh={1.2}
                style={{ letterSpacing: -0.5 }}
              >
                Alur Pengajuan Keberatan
              </Title>

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
                        lh={1.3}
                      >
                        {v.title}
                      </Text>

                      <Text
                        ta="center"
                        c={colors['white-1']}
                        fz="sm"
                        lh={1.6}
                      >
                        {v.desc}
                      </Text>
                    </Stack>
                  </Paper>
                ))}
              </SimpleGrid>
            </Stack>

            {/* Form */}
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
                  <Title
                    order={3}
                    ta="center"
                    fw={700}
                    fz={{ base: 'lg', md: 'xl' }}
                    lh={1.3}
                    mb={4}
                  >
                    Formulir Keberatan
                  </Title>

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
                    placeholder="Contoh: nama@email.com"
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
                    placeholder="Contoh: 081234567890"
                    radius="md"
                    size="md"
                    withAsterisk
                    inputMode="numeric"
                    maxLength={13}
                    value={stateKeberatan.create.form.notelp || ''}
                    onChange={(val) =>
                      (stateKeberatan.create.form.notelp = val.target.value
                        .replace(/\D/g, '')
                        .slice(0, 13))
                    }
                  />

                  <Box>
                    <Text fw={600} fz="sm" lh={1.4} mb={6}>
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
                      disabled={!isFormValid()}
                    >
                      Kirim Permohonan
                    </Button>
                  </Tooltip>
                </Stack>
              </Paper>
            </Group>

            {/* Kontak */}
            <Stack gap={4} pt="lg" align="center">
              <Title order={4} fw={700} fz="lg" lh={1.3}>
                Kontak PPID
              </Title>

              <Text fz="sm" lh={1.5} c="dimmed" ta="center">
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
