'use client'
import beasiswaDesaState from '@/app/admin/(dashboard)/_state/pendidikan/beasiswa-desa';
import colors from '@/con/colors';
import { Box, Button, Center, Group, Image, Modal, Paper, Select, SimpleGrid, Stack, Stepper, StepperStep, Text, TextInput, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconArrowRight, IconCoin, IconInfoCircle, IconSchool, IconUsers } from '@tabler/icons-react';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import BackButton from '../../desa/layanan/_com/BackButto';

const dataBeasiswa = [
  { id: 1, nama: 'Penerima Beasiswa', jumlah: '250+', icon: IconUsers },
  { id: 2, nama: 'Peluang Kelulusan', jumlah: '90%', icon: IconSchool },
  { id: 3, nama: 'Dana Tersalurkan', jumlah: '1.5M', icon: IconCoin },
];

const dataProgram = [
  { id: 1, judul: "Pelatihan SoftSkill", deskripsi: "Pengembangan diri untuk mempersiapkan karir masa depan." },
  { id: 2, judul: "Peningkatan Akses Pendidikan", deskripsi: "Memberi kesempatan bagi masyarakat kurang mampu untuk tetap sekolah." },
  { id: 3, judul: "Pendampingan Intensif", deskripsi: "Bimbingan dari mentor berpengalaman untuk mendukung akademik." },
];

function Page() {
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

  const [active, setActive] = useState(1);
  const nextStep = () => setActive((current) => (current < 5 ? current + 1 : current));
  const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));

  return (
    <Stack pos="relative" bg={colors.Bg} py="xl" gap={40}>
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>

      <Box px={{ base: 'md', md: 100 }} pb={50}>
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
          <Box>
            <Title fz={55} fw={900} c={colors['blue-button']}>
              Wujudkan Mimpi Pendidikanmu di Desa Darmasaba
            </Title>
            <Text fz="lg" mt="md" c="dimmed">
              Program beasiswa untuk mendukung pendidikan berkualitas bagi generasi muda Desa Darmasaba.
            </Text>
            <Group mt="xl">
              <Button size="lg" radius="xl" bg={colors['blue-button']} rightSection={<IconArrowRight size={20} />} onClick={open}>
                Daftar Sekarang
              </Button>
              <Button size="lg" radius="xl" variant="light" color={colors['blue-button']} rightSection={<IconInfoCircle size={20} />}>
                Pelajari Lebih Lanjut
              </Button>
            </Group>
          </Box>
          <Box>
            <Image alt="Beasiswa Desa" src="/beasiswa-siswa.png" radius="lg" loading="lazy"/>
          </Box>
        </SimpleGrid>

        <SimpleGrid mt={50} cols={{ base: 1, md: 3 }} spacing="lg">
          {dataBeasiswa.map((v, k) => {
            const IconComp = v.icon;
            return (
              <Paper key={k} p="xl" radius="xl" shadow="md" bg={colors['white-trans-1']} withBorder>
                <Stack align="center" gap="sm">
                  <IconComp size={45} color={colors['blue-button']} />
                  <Title fz={42} fw={900} c={colors['blue-button']}>{v.jumlah}</Title>
                  <Text fz="sm" ta="center">{v.nama}</Text>
                </Stack>
              </Paper>
            );
          })}
        </SimpleGrid>
      </Box>

      <Box px={{ base: 'md', md: 100 }} pb={20}>
        <Title pb={20} ta="center" order={1} fw={900} c={colors['blue-button']}>
          Keunggulan Program
        </Title>
        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
          {dataProgram.map((v, k) => (
            <Paper key={k} p="xl" radius="xl" shadow="sm" bg={colors['white-trans-1']}>
              <Title order={3} fw={700} c={colors['blue-button']} mb="xs">{v.judul}</Title>
              <Text fz="sm" c="dimmed">{v.deskripsi}</Text>
            </Paper>
          ))}
        </SimpleGrid>

        <Title py={40} ta="center" order={1} fw={900} c={colors['blue-button']}>
          Timeline Pendaftaran
        </Title>
        <Center>
          <Stepper mt={20} active={active} onStepClick={setActive} orientation="vertical" allowNextStepsSelect={false}>
            <StepperStep label="1 Maret 2025" description="Pembukaan Pendaftaran" />
            <StepperStep label="15 Maret 2025" description="Seleksi Administrasi" />
            <StepperStep label="1 April 2025" description="Tes Potensi Akademik" />
            <StepperStep label="15 April 2025" description="Wawancara" />
            <StepperStep label="1 Mei 2025" description="Pengumuman Hasil" />
          </Stepper>
        </Center>

        <Group justify="center" mt="xl">
          <Button variant="default" radius="xl" onClick={prevStep}>Kembali</Button>
          <Button radius="xl" bg={colors['blue-button']} onClick={nextStep}>Lanjut</Button>
        </Group>
      </Box>

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
    </Stack>
  );
}

export default Page;
