'use client'
import statePermohonanInformasi from '@/app/admin/(dashboard)/_state/ppid/permohonan_informasi_publik/permohonanInformasiPublik';
import colors from '@/con/colors';
import {
  ActionIcon,
  Box,
  Button,
  Center,
  Checkbox,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Tooltip,
} from '@mantine/core';
import { IconDownload, IconSend2 } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import BackButton from '../../desa/layanan/_com/BackButto';
import JenisInformasiSelector from './jenis_infromasi/jenisInformasiSelector';
import MemperolehInformasi from './memperoleh_informasi/memperolehInfromasi';
import MemperolehSalinan from './salinan_informasi/salinanInformasi';

const steps = [
  {
    id: 1,
    number: '1',
    title: 'Ajukan Permohonan',
    desc: 'Pemohon mengajukan permohonan informasi kepada badan publik secara langsung atau melalui surat elektronik.',
  },
  {
    id: 2,
    number: '2',
    title: 'Isi Formulir',
    desc: 'Lengkapi formulir dengan identitas (nama, alamat, telepon, email), jenis, format, serta cara memperoleh informasi, dan lampirkan fotokopi identitas.',
  },
  {
    id: 3,
    number: '3',
    title: 'Proses oleh PPID',
    desc: 'PPID akan memproses permohonan sesuai ketentuan yang berlaku.',
  },
  {
    id: 4,
    number: '4',
    title: 'Penyampaian Informasi',
    desc: 'Petugas PPID memberikan informasi sesuai permohonan kepada pemohon.',
  },
];

function Page() {
  const permohonanInformasiPublikState = useProxy(statePermohonanInformasi);
  const router = useRouter();

  const submitForms = () => {
    const { create } = permohonanInformasiPublikState.statepermohonanInformasiPublik;

    if (
      create.form.name &&
      create.form.nik &&
      create.form.notelp &&
      create.form.alamat &&
      create.form.email &&
      create.form.jenisInformasiDimintaId &&
      create.form.caraMemperolehInformasiId &&
      create.form.caraMemperolehSalinanInformasiId
    ) {
      create.create();
      router.push('/darmasaba/permohonan/berhasil');
    } else {
      console.log('Validasi gagal, form tidak lengkap');
    }
  };

  return (
    <Stack pos="relative" bg={colors.Bg} py="xl" gap={40}>
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>

      <Text
        ta="center"
        fz={{ base: '2rem', md: '2.5rem' }}
        c={colors['blue-button']}
        fw="bold"
      >
        Permohonan Informasi Publik
      </Text>

      <Box px={{ base: 'md', md: 100 }}>
        <Stack gap="xl">
          <Paper
            p="xl"
            radius="lg"
            withBorder
            shadow="sm"
            bg={colors['white-trans-1']}
          >
            <Text
              pb={30}
              ta="center"
              fw="bold"
              fz={{ base: 'h4', md: 'h3' }}
              c={colors['blue-button']}
            >
              Tata Cara Permohonan
            </Text>

            <SimpleGrid pb={30} cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
              {steps.map((v) => (
                <Paper
                  key={v.id}
                  p="lg"
                  radius="md"
                  shadow="md"
                  bg={colors['blue-button']}
                >
                  <Stack justify="space-between" gap="sm">
                    <Center>
                      <ActionIcon
                        bg={colors['white-1']}
                        radius="xl"
                        size={60}
                        variant="light"
                      >
                        <Text
                          c={colors['blue-button']}
                          ta="center"
                          fw="bold"
                          fz="h3"
                        >
                          {v.number}
                        </Text>
                      </ActionIcon>
                    </Center>
                    <Text
                      ta="center"
                      c={colors['white-1']}
                      fw="bold"
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

            <Center pb={30}>
              <Tooltip label="Unduh dokumen tata cara permohonan" withArrow>
                <Button
                  fz="sm"
                  size="md"
                  radius="md"
                  bg={colors['blue-button']}
                  leftSection={
                    <IconDownload size={20} color={colors['white-1']} />
                  }
                >
                  Unduh Tata Cara
                </Button>
              </Tooltip>
            </Center>

            <Group justify="center">
              <Paper
                p="xl"
                radius="lg"
                withBorder
                shadow="sm"
                bg={colors['white-1']}
                w="100%"
                maw={800}
              >
                <Stack gap="md">
                  <Text
                    fw="bold"
                    fz={{ base: 'h4', md: 'h3' }}
                    ta="center"
                    c={colors['blue-button']}
                  >
                    Formulir Permohonan Informasi
                  </Text>

                  <TextInput
                    label="Nama Lengkap"
                    placeholder="Masukkan nama lengkap Anda"
                    withAsterisk
                    onChange={(val) => {
                      permohonanInformasiPublikState.statepermohonanInformasiPublik.create.form.name =
                        val.target.value;
                    }}
                  />
                  <TextInput
                    label="Nomor Induk Kependudukan (NIK)"
                    placeholder="Masukkan NIK"
                    withAsterisk
                    onChange={(val) => {
                      permohonanInformasiPublikState.statepermohonanInformasiPublik.create.form.nik =
                        val.target.value;
                    }}
                  />
                  <TextInput
                    label="Nomor Telepon"
                    placeholder="Masukkan nomor telepon aktif"
                    withAsterisk
                    onChange={(val) => {
                      permohonanInformasiPublikState.statepermohonanInformasiPublik.create.form.notelp =
                        val.target.value;
                    }}
                  />
                  <TextInput
                    label="Alamat Lengkap"
                    placeholder="Masukkan alamat sesuai identitas"
                    withAsterisk
                    onChange={(val) => {
                      permohonanInformasiPublikState.statepermohonanInformasiPublik.create.form.alamat =
                        val.target.value;
                    }}
                  />
                  <TextInput
                    label="Alamat Email"
                    placeholder="Masukkan alamat email aktif"
                    withAsterisk
                    onChange={(val) => {
                      permohonanInformasiPublikState.statepermohonanInformasiPublik.create.form.email =
                        val.target.value;
                    }}
                  />

                  <JenisInformasiSelector
                    onChange={(val) => {
                      permohonanInformasiPublikState.statepermohonanInformasiPublik.create.form.jenisInformasiDimintaId =
                        val.id;
                    }}
                  />
                  <MemperolehInformasi
                    onChange={(val) => {
                      permohonanInformasiPublikState.statepermohonanInformasiPublik.create.form.caraMemperolehInformasiId =
                        val.id;
                    }}
                  />
                  <MemperolehSalinan
                    onChange={(val) => {
                      permohonanInformasiPublikState.statepermohonanInformasiPublik.create.form.caraMemperolehSalinanInformasiId =
                        val.id;
                    }}
                  />

                  <Box py="sm">
                    <Checkbox
                      size="sm"
                      color={colors['blue-button']}
                      label="Saya menyatakan bahwa data yang saya berikan benar adanya dan informasi yang diminta akan digunakan sesuai ketentuan."
                    />
                  </Box>

                  <Group justify="center" pt="sm">
                    <Button
                      size="md"
                      radius="md"
                      bg={colors['blue-button']}
                      leftSection={<IconSend2 size={20} color={colors['white-1']} />}
                      onClick={submitForms}
                    >
                      Kirim Permohonan
                    </Button>
                  </Group>
                </Stack>
              </Paper>
            </Group>
          </Paper>
        </Stack>
      </Box>
    </Stack>
  );
}

export default Page;
