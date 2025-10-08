'use client';

import {
  Box,
  Button,
  Container,
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
import { IconArrowLeft } from '@tabler/icons-react';
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
      nik: "",
      tempatLahir: "",
      tanggalLahir: "",
      jenisKelamin: "",
      kewarganegaraan: "",
      agama: "",
      alamatKTP: "",
      alamatDomisili: "",
      noHp: "",
      email: "",
      statusPernikahan: "",
      ukuranBaju: "",
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
          <Title order={2} c="blue.9">
            Program Beasiswa Pendidikan Desa Darmasaba
          </Title>
          <Text c="dimmed">
            Program ini bertujuan untuk mendukung pendidikan generasi muda di Desa Darmasaba
            agar dapat melanjutkan studi ke jenjang lebih tinggi dengan dukungan finansial dan pendampingan.
          </Text>
        </Stack>
      </Container>

      {/* Tentang Program */}
      <Container size="lg" py="xl">
        <Title order={3} mb="sm">
          Tentang Program
        </Title>
        <Text>
          Program Beasiswa Desa Darmasaba adalah inisiatif pemerintah desa untuk meningkatkan akses
          pendidikan bagi siswa berprestasi dan kurang mampu. Melalui program ini, desa memberikan bantuan
          biaya sekolah, bimbingan akademik, serta pelatihan soft skill bagi peserta terpilih.
        </Text>
      </Container>

      {/* Syarat dan Ketentuan */}
      <Container size="lg" py="xl">
        <Title order={3} mb="sm">
          Syarat Pendaftaran
        </Title>

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
        <Title order={3} mb="sm">
          Proses Seleksi
        </Title>

        <Timeline active={4} bulletSize={24} lineWidth={2}>
          <Timeline.Item title="Pendaftaran Online">
            <Text c="dimmed" size="sm">
              Calon peserta mengisi formulir pendaftaran dan mengunggah dokumen pendukung.
            </Text>
          </Timeline.Item>

          <Timeline.Item title="Seleksi Administrasi">
            <Text c="dimmed" size="sm">
              Panitia memverifikasi kelengkapan dan validitas berkas.
            </Text>
          </Timeline.Item>

          <Timeline.Item title="Wawancara dan Penilaian">
            <Text c="dimmed" size="sm">
              Peserta yang lolos administrasi akan diundang untuk wawancara langsung dengan tim seleksi.
            </Text>
          </Timeline.Item>

          <Timeline.Item title="Pengumuman Penerima">
            <Text c="dimmed" size="sm">
              Daftar penerima beasiswa diumumkan melalui website resmi Desa Darmasaba.
            </Text>
          </Timeline.Item>
        </Timeline>
      </Container>

      {/* Testimoni */}
      <Container size="lg" py="xl">
        <Title order={3} mb="sm">
          Cerita Sukses Penerima Beasiswa
        </Title>

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
        <Title order={3}>Siap Bergabung dengan Program Ini?</Title>
        <Text c="dimmed" mb="md">
          Segera daftar dan wujudkan mimpimu bersama Desa Darmasaba.
        </Text>
        <Button onClick={open} size="lg" radius="xl" color="blue">
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
              label="NIK"
              placeholder="Masukkan NIK"
              onChange={(val) => { beasiswaDesa.create.form.nik = val.target.value }} />
            <TextInput
              label="Tempat Lahir"
              placeholder="Masukkan tempat lahir"
              onChange={(val) => { beasiswaDesa.create.form.tempatLahir = val.target.value }} />
            <TextInput
              type="date"
              label="Tanggal Lahir"
              placeholder="Pilih tanggal lahir"
              onChange={(val) => { beasiswaDesa.create.form.tanggalLahir = val.target.value }} />
            <Select
              label="Jenis Kelamin"
              placeholder="Pilih jenis kelamin"
              data={[{ value: "LAKI_LAKI", label: "Laki-laki" }, { value: "PEREMPUAN", label: "Perempuan" }]}
              onChange={(val) => { if (val) beasiswaDesa.create.form.jenisKelamin = val }} />
            <TextInput
              label="Kewarganegaraan"
              placeholder="Masukkan kewarganegaraan"
              onChange={(val) => { beasiswaDesa.create.form.kewarganegaraan = val.target.value }} />
            <Select
              label="Agama"
              placeholder="Pilih agama"
              data={[{ value: "ISLAM", label: "Islam" }, { value: "KRISTEN_PROTESTAN", label: "Kristen Protestan" }, { value: "KRISTEN_KATOLIK", label: "Kristen Katolik" }, { value: "HINDU", label: "Hindu" }, { value: "BUDDHA", label: "Buddha" }, { value: "KONGHUCU", label: "Konghucu" }, { value: "LAINNYA", label: "Lainnya" }]}
              onChange={(val) => { if (val) beasiswaDesa.create.form.agama = val }} />
            <TextInput
              label="Alamat KTP"
              placeholder="Masukkan alamat sesuai KTP"
              onChange={(val) => { beasiswaDesa.create.form.alamatKTP = val.target.value }} />
            <TextInput
              label="Alamat Domisili"
              placeholder="Masukkan alamat domisili"
              onChange={(val) => { beasiswaDesa.create.form.alamatDomisili = val.target.value }} />
            <TextInput
              type="number"
              label="Nomor HP"
              placeholder="Masukkan nomor HP"
              onChange={(val) => { beasiswaDesa.create.form.noHp = val.target.value }} />
            <TextInput
              type="email"
              label="Email"
              placeholder="Masukkan alamat email"
              onChange={(val) => { beasiswaDesa.create.form.email = val.target.value }} />
            <Select
              label="Status Pernikahan"
              placeholder="Pilih status pernikahan"
              data={[{ value: "BELUM_MENIKAH", label: "Belum Menikah" }, { value: "MENIKAH", label: "Menikah" }, { value: "JANDA_DUDA", label: "Janda/Duda" }]}
              onChange={(val) => { if (val) beasiswaDesa.create.form.statusPernikahan = val }} />
            <Select
              label="Ukuran Baju"
              placeholder="Pilih ukuran baju"
              data={[{ value: "S", label: "S" }, { value: "M", label: "M" }, { value: "L", label: "L" }, { value: "XL", label: "XL" }, { value: "XXL", label: "XXL" }, { value: "LAINNYA", label: "Lainnya" }]}
              onChange={(val) => { if (val) beasiswaDesa.create.form.ukuranBaju = val }} />
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
