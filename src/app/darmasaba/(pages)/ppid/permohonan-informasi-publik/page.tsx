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
  Title
} from '@mantine/core';
import { IconSend2 } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import BackButton from '../../pemerintahan/layanan/_com/BackButto';
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
  const permohonanInformasiPublikState = useProxy(statePermohonanInformasi, { sync: true });
  const router = useRouter();
  // Pernyataan persetujuan wajib dicentang sebelum kirim.
  const [setuju, setSetuju] = useState(false);

  // Tandai field yang sudah disentuh (blur) agar pesan error tidak langsung
  // merah saat halaman pertama kali dibuka.
  const [touched, setTouched] = useState({
    name: false,
    nik: false,
    notelp: false,
    alamat: false,
    email: false,
  });

  // Helper function to validate email format
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Check if form is valid.
  // Catatan: form.x?.trim() !== '' bernilai true saat field masih undefined
  // (belum disentuh) → tombol kirim aktif walau form kosong. Pakai truthy check.
  const isFormValid = () => {
    const form = permohonanInformasiPublikState.statepermohonanInformasiPublik.create.form;
    const nikDigits = (form.nik || '').replace(/\D/g, '');
    const notelpDigits = (form.notelp || '').replace(/\D/g, '');
    return (
      !!form.name?.trim() &&
      nikDigits.length === 16 &&
      notelpDigits.length >= 10 &&
      !!form.alamat?.trim() &&
      !!form.email?.trim() &&
      isValidEmail(form.email || '') &&
      !!form.jenisInformasiDimintaId &&
      !!form.caraMemperolehInformasiId &&
      !!form.caraMemperolehSalinanInformasiId &&
      setuju
    );
  };

  // Pesan error per field (hanya tampil setelah field disentuh).
  const form = permohonanInformasiPublikState.statepermohonanInformasiPublik.create.form;
  const nikDigits = (form.nik || '').replace(/\D/g, '');
  const notelpDigits = (form.notelp || '').replace(/\D/g, '');

  const nameError =
    touched.name && (form.name || '').trim().length < 3
      ? 'Nama lengkap wajib diisi (min. 3 karakter)'
      : null;

  const nikError = touched.nik
    ? nikDigits.length === 0
      ? 'NIK wajib diisi'
      : nikDigits.length !== 16
        ? 'NIK harus 16 digit'
        : null
    : null;

  const notelpError = touched.notelp
    ? notelpDigits.length === 0
      ? 'Nomor telepon wajib diisi'
      : notelpDigits.length < 10
        ? 'Nomor telepon minimal 10 digit'
        : null
    : null;

  const alamatError =
    touched.alamat && !form.alamat?.trim()
      ? 'Alamat lengkap wajib diisi'
      : null;

  const emailError = touched.email
    ? !form.email?.trim()
      ? 'Alamat email wajib diisi'
      : !isValidEmail(form.email)
        ? 'Format email tidak valid'
        : null
    : null;

  const submitForms = async () => {
    const { create } = permohonanInformasiPublikState.statepermohonanInformasiPublik;
    const hasil = await create.create();
    if (hasil) {
      // Reset proxy form (NIK/notelp controlled) + checkbox agar tidak menyisakan
      // data lama saat pengguna kembali ke halaman ini.
      create.form = {} as typeof create.form;
      setSetuju(false);
      setTouched({
        name: false,
        nik: false,
        notelp: false,
        alamat: false,
        email: false,
      });
      router.push('/darmasaba/permohonan/berhasil');
    }
  };

  return (
    <Stack pos="relative" bg={colors.Bg} py="xl" gap={40}>
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>

      {/* MAIN PAGE TITLE */}
      <Title
        order={1}
        ta="center"
        fz={{ base: '1.8rem', sm: '2.2rem', md: '2.6rem' }}
        lh={1.2}
        c={colors['blue-button']}
        style={{ fontWeight: 700 }}
      >
        Permohonan Informasi Publik
      </Title>

      <Box px={{ base: 'md', md: 100 }}>
        <Stack gap="xl">
          <Paper
            p="xl"
            radius="lg"
            withBorder
            shadow="sm"
            bg={colors['white-trans-1']}
          >
            {/* SUBTITLE */}
            <Title
              order={2}
              pb={30}
              ta="center"
              fz={{ base: '1.4rem', md: '1.8rem' }}
              lh={1.3}
              c={colors['blue-button']}
              style={{ fontWeight: 700 }}
            >
              Tata Cara Permohonan
            </Title>

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
                          fz="h2"
                          lh={1}
                        >
                          {v.number}
                        </Text>
                      </ActionIcon>
                    </Center>

                    <Title
                      order={4}
                      ta="center"
                      c={colors['white-1']}
                      fz="lg"
                      lh={1.3}
                      style={{ fontWeight: 700 }}
                    >
                      {v.title}
                    </Title>

                    <Text
                      ta="center"
                      c={colors['white-1']}
                      fz="sm"
                      lh={1.4}
                    >
                      {v.desc}
                    </Text>
                  </Stack>
                </Paper>
              ))}
            </SimpleGrid>

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

                  {/* FORM TITLE */}
                  <Title
                    order={2}
                    ta="center"
                    fz={{ base: '1.4rem', md: '1.8rem' }}
                    lh={1.3}
                    c={colors['blue-button']}
                    style={{ fontWeight: 700 }}
                  >
                    Formulir Permohonan Informasi
                  </Title>

                  {/* INPUTS */}
                  <TextInput
                    label="Nama Lengkap"
                    placeholder="Masukkan nama lengkap Anda"
                    withAsterisk
                    error={nameError}
                    value={permohonanInformasiPublikState.statepermohonanInformasiPublik.create.form.name || ''}
                    onChange={(val) => {
                      permohonanInformasiPublikState.statepermohonanInformasiPublik.create.form.name =
                        val.target.value.replace(/[0-9]/g, '');
                    }}
                    onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                  />

                  <TextInput
                    label="Nomor Induk Kependudukan (NIK)"
                    placeholder="Masukkan NIK"
                    withAsterisk
                    inputMode="numeric"
                    maxLength={16}
                    error={nikError}
                    value={permohonanInformasiPublikState.statepermohonanInformasiPublik.create.form.nik || ''}
                    onChange={(val) => {
                      permohonanInformasiPublikState.statepermohonanInformasiPublik.create.form.nik =
                        val.target.value.replace(/\D/g, '').slice(0, 16);
                    }}
                    onBlur={() => setTouched((t) => ({ ...t, nik: true }))}
                  />

                  <TextInput
                    label="Nomor Telepon"
                    placeholder="Masukkan nomor telepon aktif"
                    withAsterisk
                    inputMode="numeric"
                    maxLength={13}
                    error={notelpError}
                    value={permohonanInformasiPublikState.statepermohonanInformasiPublik.create.form.notelp || ''}
                    onChange={(val) => {
                      permohonanInformasiPublikState.statepermohonanInformasiPublik.create.form.notelp =
                        val.target.value.replace(/\D/g, '').slice(0, 13);
                    }}
                    onBlur={() => setTouched((t) => ({ ...t, notelp: true }))}
                  />

                  <TextInput
                    label="Alamat Lengkap"
                    placeholder="Masukkan alamat sesuai identitas"
                    withAsterisk
                    error={alamatError}
                    value={permohonanInformasiPublikState.statepermohonanInformasiPublik.create.form.alamat || ''}
                    onChange={(val) => {
                      permohonanInformasiPublikState.statepermohonanInformasiPublik.create.form.alamat =
                        val.target.value;
                    }}
                    onBlur={() => setTouched((t) => ({ ...t, alamat: true }))}
                  />

                  <TextInput
                    label="Alamat Email"
                    placeholder="Masukkan alamat email aktif"
                    type="email"
                    withAsterisk
                    error={emailError}
                    value={permohonanInformasiPublikState.statepermohonanInformasiPublik.create.form.email || ''}
                    onChange={(val) => {
                      permohonanInformasiPublikState.statepermohonanInformasiPublik.create.form.email =
                        val.target.value;
                    }}
                    onBlur={() => setTouched((t) => ({ ...t, email: true }))}
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
                      checked={setuju}
                      onChange={(e) => setSetuju(e.currentTarget.checked)}
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
                      disabled={!isFormValid()}
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
