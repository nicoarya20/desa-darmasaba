'use client';

import {
  Box,
  Button,
  Container,
  Divider,
  Group,
  Modal,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Timeline,
  Title
} from '@mantine/core';
import { IconArrowLeft, IconChecklist, IconInfoCircle, IconQuote, IconSchool, IconTimeline, IconUserPlus } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useDisclosure } from '@mantine/hooks';
import { useProxy } from 'valtio/utils';
import beasiswaDesaState from '@/app/admin/(dashboard)/_state/pendidikan/beasiswa-desa';
import colors from '@/con/colors';


export default function BeasiswaPage() {
  const router = useRouter();
  const beasiswaDesa = useProxy(beasiswaDesaState.beasiswaPendaftar)
  const [opened, { open, close }] = useDisclosure(false);
  const resetForm = () => {
    beasiswaDesa.create.form = {
      namaLengkap: "",
      nis: "",
      kelas: "",
      jenisKelamin: "",
      alamatDomisili: "",
      tempatLahir: "",
      tanggalLahir: "",
      namaOrtu: "",
      nik: "",
      pekerjaanOrtu: "",
      penghasilan: "",
      noHp: "",
    };
  };

  const handleSubmit = async () => {
    await beasiswaDesa.create.create();
    resetForm();
    close();
  };

  return (
    <Box bg="#f1f5fb" pb="xl" pt="md">
      {/* Tombol Kembali */}
      <Container size="lg">
        <Button
          variant="subtle"
          color="blue"
          leftSection={<IconArrowLeft size={18} />}
          onClick={() => router.back()}
          mb="lg"
        >
          Kembali
        </Button>
      </Container>

      {/* Hero Section */}
      <Container size="lg" py="xl">
        <Stack gap="md" maw={600}>
          <Group>
            <IconSchool size={30} color={colors["blue-button"]} />
            <Title order={2} c={colors["blue-button"]}>Program Beasiswa Pendidikan Desa Darmasaba</Title>
          </Group>
          <Text>
            Program ini bertujuan untuk mendukung pendidikan generasi muda di Desa Darmasaba
            agar dapat melanjutkan studi ke jenjang lebih tinggi dengan dukungan finansial dan pendampingan.
          </Text>
        </Stack>
      </Container>

      {/* Tentang Program */}
      <Container size="lg" py="xl">
        <Group mb="sm">
          <IconInfoCircle size={24} color={colors["blue-button"]} />
          <Title order={3} c={colors["blue-button"]}>Tentang Program</Title>
        </Group>
        <Text>
          Program Beasiswa Desa Darmasaba adalah inisiatif pemerintah desa untuk meningkatkan akses
          pendidikan bagi siswa berprestasi dan kurang mampu. Melalui program ini, desa memberikan bantuan
          biaya sekolah, bimbingan akademik, serta pelatihan soft skill bagi peserta terpilih.
        </Text>

        {/* Tambahkan info tahun berjalan di sini */}
        <Paper mt="md" p="md" radius="lg" shadow="xs" bg="#f8fbff" withBorder>
          <Text fw={500}>
            Periode Beasiswa Tahun 2025
          </Text>
          <Text fz="sm" c="dimmed">
            Pendaftaran beasiswa dibuka mulai <strong>1 Januari 2025</strong> dan ditutup pada <strong>31 Mei 2025</strong>.
            Pengumuman hasil seleksi akan diumumkan pada pertengahan Juni 2025 melalui website resmi Desa Darmasaba.
          </Text>
        </Paper>
      </Container>

      {/* Syarat dan Ketentuan */}
      <Container size="lg" py="xl">
        <Group mb="sm">
          <IconChecklist size={24} color={colors["blue-button"]} />
          <Title order={3} c={colors["blue-button"]}>Syarat Pendaftaran</Title>
        </Group>

        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
          <Paper shadow="sm" p="md" radius="lg" withBorder>
            <Text fw={500}>Domisili Desa Darmasaba</Text>
            <Text c="dimmed" fz="sm">
              Peserta harus merupakan warga desa yang berdomisili minimal 2 tahun.
            </Text>
          </Paper>

          <Paper shadow="sm" p="md" radius="lg" withBorder>
            <Text fw={500}>Nilai Akademik</Text>
            <Text c="dimmed" fz="sm">
              Rata-rata nilai raport minimal 80 atau setara.
            </Text>
          </Paper>

          <Paper shadow="sm" p="md" radius="lg" withBorder>
            <Text fw={500}>Surat Rekomendasi</Text>
            <Text c="dimmed" fz="sm">
              Diperlukan surat rekomendasi dari sekolah atau guru wali kelas.
            </Text>
          </Paper>
        </SimpleGrid>
      </Container>

      {/* Proses Seleksi */}
      <Container size="lg" py="xl">
        <Group mb="sm">
          <IconTimeline size={24} color={colors["blue-button"]} />
          <Title order={3} c={colors["blue-button"]}>Proses Seleksi</Title>
        </Group>

        <Timeline active={4} bulletSize={24} lineWidth={2}>
          <Timeline.Item title="Pendaftaran Online">
            <Text c="dimmed" size="sm">
              Calon peserta mengisi formulir pendaftaran dan mengunggah dokumen pendukung.
            </Text>
            <Text size="sm" fw={500} mt={4}>
              Estimasi waktu: 1 Februari – 31 Mei 2025
            </Text>
          </Timeline.Item>

          <Timeline.Item title="Seleksi Administrasi">
            <Text c="dimmed" size="sm">
              Panitia memverifikasi kelengkapan dan validitas berkas.
            </Text>
            <Text size="sm" fw={500} mt={4}>
              Estimasi waktu: 5–7 hari kerja setelah penutupan pendaftaran
            </Text>
          </Timeline.Item>

          <Timeline.Item title="Wawancara dan Penilaian">
            <Text c="dimmed" size="sm">
              Peserta yang lolos administrasi akan diundang untuk wawancara langsung dengan tim seleksi.
            </Text>
            <Text size="sm" fw={500} mt={4}>
              Estimasi waktu: 7–10 hari kerja setelah pengumuman seleksi administrasi
            </Text>
          </Timeline.Item>

          <Timeline.Item title="Pengumuman Penerima">
            <Text c="dimmed" size="sm">
              Daftar penerima beasiswa diumumkan melalui website resmi Desa Darmasaba.
            </Text>
            <Text size="sm" fw={500} mt={4}>
              Estimasi waktu: 5 hari kerja setelah tahap wawancara selesai
            </Text>
          </Timeline.Item>
        </Timeline>

        <Text c="dimmed" size="sm" mt="lg" ta="center">
          Total estimasi keseluruhan proses: sekitar 3–4 minggu setelah penutupan pendaftaran
        </Text>
      </Container>


      {/* Testimoni */}
      <Container size="lg" py="xl">
        <Group mb="sm">
          <IconQuote size={24} color={colors["blue-button"]} />
          <Title order={3} c={colors["blue-button"]}>Cerita Sukses Penerima Beasiswa</Title>
        </Group>

        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
          <Paper shadow="md" p="lg" radius="lg">
            <Text fs={'italic'}>
              “Program ini sangat membantu saya melanjutkan kuliah di Universitas Udayana. Terima kasih Desa Darmasaba!”
            </Text>
            <Text mt="sm" fw={600}>
              – Ni Kadek Ayu S., Penerima Beasiswa 2024
            </Text>
          </Paper>

          <Paper shadow="md" p="lg" radius="lg">
            <Text fs={'italic'}>
              “Selain bantuan dana, kami juga mendapatkan pelatihan komputer dan bahasa Inggris.”
            </Text>
            <Text mt="sm" fw={600}>
              – I Made Gede A., Penerima Beasiswa 2023
            </Text>
          </Paper>
        </SimpleGrid>
      </Container>

      {/* CTA Akhir */}
      <Container size="lg" py="xl" ta="center">
        <Group justify="center" mb="sm">
          <IconUserPlus size={28} color={colors["blue-button"]} />
          <Title order={3} c={colors["blue-button"]}>Siap Bergabung dengan Program Ini?</Title>
        </Group>
        <Text c="dimmed" mb="md">
          Segera daftar dan wujudkan mimpimu bersama Desa Darmasaba.
        </Text>
        <Button onClick={open} size="lg" radius="xl" bg={colors["blue-button"]}>
          Daftar Sekarang
        </Button>
      </Container>

      <Modal
        opened={opened}
        onClose={close}
        radius="xl"
        size="lg"
        transitionProps={{ transition: 'fade', duration: 200 }}
        title={
          <Text fz="xl" fw={800} c={colors['blue-button']}>
            Formulir Beasiswa
          </Text>
        }
      >
        <Paper p="lg" radius="xl" withBorder shadow="sm">
          <Stack gap="sm">
            <TextInput
              label="Nama Lengkap"
              placeholder="Masukkan nama lengkap"
              onChange={(val) => { beasiswaDesa.create.form.namaLengkap = val.target.value }} />
            <TextInput
              type="number"
              label="NIS"
              placeholder="Masukkan NIS"
              onChange={(val) => { beasiswaDesa.create.form.nis = val.target.value }} />
            <TextInput
              label="Kelas"
              placeholder="Masukkan kelas"
              onChange={(val) => { beasiswaDesa.create.form.kelas = val.target.value }} />
            <Select
              label="Jenis Kelamin"
              placeholder="Pilih jenis kelamin"
              data={[{ value: "LAKI_LAKI", label: "Laki-laki" }, { value: "PEREMPUAN", label: "Perempuan" }]}
              onChange={(val) => { if (val) beasiswaDesa.create.form.jenisKelamin = val }} />
            <TextInput
              label="Alamat Domisili"
              placeholder="Masukkan alamat domisili"
              onChange={(val) => { beasiswaDesa.create.form.alamatDomisili = val.target.value }} />
            <TextInput
              label="Tempat Lahir"
              placeholder="Masukkan tempat lahir"
              onChange={(val) => { beasiswaDesa.create.form.tempatLahir = val.target.value }} />
            <TextInput
              type="date"
              label="Tanggal Lahir"
              placeholder="Pilih tanggal lahir"
              onChange={(val) => { beasiswaDesa.create.form.tanggalLahir = val.target.value }} />
            <Box pt={15} pb={10}>
              <Divider />
            </Box>
            <TextInput
              label="Nama Orang Tua / Wali"
              placeholder="Masukkan nama orang tua / wali"
              onChange={(val) => { beasiswaDesa.create.form.namaOrtu = val.target.value }} />
            <TextInput
              label="NIK Orang Tua / Wali"
              placeholder="Masukkan NIK orang tua / wali"
              onChange={(val) => { beasiswaDesa.create.form.nik = val.target.value }} />
            <TextInput
              label="Pekerjaan Orang Tua / Wali"
              placeholder="Masukkan pekerjaan orang tua / wali"
              onChange={(val) => { beasiswaDesa.create.form.pekerjaanOrtu = val.target.value }} />
            <TextInput
              label="Penghasilan Orang Tua / Wali"
              placeholder="Masukkan penghasilan orang tua / wali"
              onChange={(val) => { beasiswaDesa.create.form.penghasilan = val.target.value }} />
            <TextInput
              label="No HP"
              placeholder="Masukkan no hp"
              onChange={(val) => { beasiswaDesa.create.form.noHp = val.target.value }} />
            <Group justify="flex-end" mt="md">
              <Button variant="default" radius="xl" onClick={close}>Batal</Button>
              <Button radius="xl" bg={colors['blue-button']} onClick={handleSubmit}>Kirim</Button>
            </Group>
          </Stack>
        </Paper>
      </Modal>
    </Box>
  );
}
