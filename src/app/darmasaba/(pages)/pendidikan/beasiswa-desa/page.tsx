'use client'
import colors from '@/con/colors';
import { Box, Button, Center, Group, Image, Modal, Paper, Select, SimpleGrid, Stack, Stepper, StepperStep, Text, TextInput, Title } from '@mantine/core';
import { useState } from 'react';
import BackButton from '../../desa/layanan/_com/BackButto';
import { useDisclosure } from '@mantine/hooks';
import { useProxy } from 'valtio/utils';
import beasiswaDesaState from '@/app/admin/(dashboard)/_state/pendidikan/beasiswa-desa';

const dataBeasiswa = [
  {
    id: 1,
    nama: 'Penerima Beasiswa',
    jumlah: '250+'
  },
  {
    id: 2,
    nama: 'Peluang Kelulusan',
    jumlah: '90%'
  },
  {
    id: 3,
    nama: 'Dana Tersalurkan',
    jumlah: '1.5M'
  },
]
const dataProgram = [
  {
    id: 1,
    judul: "Pelatihan SoftSkill",
    deskripsi: "Program pengembangan diri untuk mempersiapkan karir masa depan",
  },
  {
    id: 2,
    judul: "Peningkatan Akses Pendidikan ",
    deskripsi: "Program yang menjangkau masyarakat kurang mampu secara finansial, mengurangi angka putus sekolah",
  },
  {
    id: 3,
    judul: "Pendampingan Intensif",
    deskripsi: "Program dengan mentor berpengalaman yang membimbing dalam perjalanan akademik",
  }
]
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
  }

  const handleSubmit = async () => {
    await beasiswaDesa.create.create();
    resetForm();
    close();
  }

  const [active, setActive] = useState(1);
  const nextStep = () => setActive((current) => (current < 5 ? current + 1 : current));
  const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));
  return (
    <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"22"}>
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>
      {/* Page 1 */}
      <Box px={{ base: 'md', md: 100 }} pb={50}>
        <SimpleGrid
          cols={{
            base: 1,
            md: 2
          }}
        >
          <Box>
            <Title fz={55} fw={'bold'} c={colors['blue-button']}>
              Wujudkan Mimpi Pendidikanmu di Desa Darmasaba
            </Title>
            <Text fz={'xl'} >
              Program beasiswa komprehensif untuk mendukung pendidikan berkualitas bagi putra-putri Desa Darmasaba.
            </Text>
            <SimpleGrid
              mt={10}
              cols={{
                base: 1,
                md: 2
              }}
            >
              <Button bg={colors['blue-button']} fz={'lg'} onClick={open}>Daftar Sekarang</Button>
              <Button bg={colors['blue-button-trans']} fz={'lg'}>Pelajari Lebih Lanjut</Button>
            </SimpleGrid>
          </Box>
          <Box>
            <Image alt='' src={'/api/img/beasiswa-siswa.png'} />
          </Box>
        </SimpleGrid>
        <SimpleGrid mt={30}
          cols={{
            base: 1,
            md: 3
          }}
        >
          {dataBeasiswa.map((v, k) => {
            return (
              <Box key={k}>
                <Paper p={'xl'} bg={colors['white-trans-1']}>
                  <Title ta={'center'} fz={55} fw={'bold'} c={colors['blue-button']}>
                    {v.jumlah}
                  </Title>
                  <Text ta={'center'}>
                    {v.nama}
                  </Text>
                </Paper>
              </Box>
            )
          })}
        </SimpleGrid>
      </Box>
      {/* ---- */}
      <Box px={{ base: 'md', md: 100 }} pb={20}>
        <Title pb={20} ta={'center'} order={1} fw={'bold'} c={colors['blue-button']}>
          Keunggulan Program
        </Title>
        <Paper p={'xl'} bg={colors['white-trans-1']}>
          <SimpleGrid
            cols={{
              base: 1,
              md: 3
            }}
          >
            {dataProgram.map((v, k) => {
              return (
                <Box key={k}>
                  <Title order={2} fw={'bold'} c={colors['blue-button']}>
                    {v.judul}
                  </Title>
                  <Text>
                    {v.deskripsi}
                  </Text>
                  {/* <Divider orientation="vertical" size="md" h="auto" /> */}
                </Box>
              )
            })}
          </SimpleGrid>
        </Paper>
        <Title py={20} ta={'center'} order={1} fw={'bold'} c={colors['blue-button']}>
          Timeline Pendaftaran
        </Title>
        <Center>
          <Stepper mt={20} active={active} onStepClick={setActive} orientation="vertical" allowNextStepsSelect={false}>
            <StepperStep label="Pembukaan Pendaftaran 1 Maret 2025" description="" />
            <StepperStep label="Seleksi Administrasi 15 Maret 2025" description="" />
            <StepperStep label="Tes Potensi Akademik 1 April 2025" description="" />
            <StepperStep label="Wawancara 15 April 2025" description="" />
            <StepperStep label="Pengumuman 1 Mei 2025" description="" />
          </Stepper>
        </Center>

        <Group justify="center" mt="xl">
          <Button variant="default" onClick={prevStep}>Back</Button>
          <Button onClick={nextStep}>Next step</Button>
        </Group>
      </Box>

      <Modal
        opened={opened}
        onClose={close}
        radius={0}
        transitionProps={{ transition: 'fade', duration: 200 }}
      >
        <Paper p={"md"} withBorder>
          <Stack gap={"xs"}>
            <Title order={3}>Ajukan Beasiswa</Title>
            <TextInput
              label={<Text fz={"sm"} fw={"bold"}>Nama</Text>}
              placeholder="masukkan nama"
              onChange={(val) => {
                beasiswaDesa.create.form.namaLengkap = val.target.value
              }}
            />
            <TextInput
              type='number'
              label={<Text fz={"sm"} fw={"bold"}>NIK</Text>}
              placeholder="masukkan nik"
              onChange={(val) => {
                beasiswaDesa.create.form.nik = val.target.value
              }}
            />
            <TextInput
              label={<Text fz={"sm"} fw={"bold"}>Tempat Lahir</Text>}
              placeholder="masukkan tempat lahir"
              onChange={(val) => {
                beasiswaDesa.create.form.tempatLahir = val.target.value
              }}
            />
            <TextInput
              type='date'
              label={<Text fz={"sm"} fw={"bold"}>Tanggal Lahir</Text>}
              placeholder="masukkan tanggal lahir"
              onChange={(val) => {
                beasiswaDesa.create.form.tanggalLahir = val.target.value
              }}
            />
            <Select
              label={<Text fz={"sm"} fw={"bold"}>Jenis Kelamin</Text>}
              placeholder="Pilih jenis kelamin"
              data={[
                { value: "LAKI_LAKI", label: "Laki-laki" },
                { value: "PEREMPUAN", label: "Perempuan" },
              ]}
              onChange={(val) => {
                if (val) beasiswaDesa.create.form.jenisKelamin = val as "LAKI_LAKI" | "PEREMPUAN";
              }}
            />
            <TextInput
              label={<Text fz={"sm"} fw={"bold"}>Kewarganegaraan</Text>}
              placeholder="masukkan kewarganegaraan"
              onChange={(val) => {
                beasiswaDesa.create.form.kewarganegaraan = val.target.value
              }}
            />
            <Select
              label={<Text fz={"sm"} fw={"bold"}>Agama</Text>}
              placeholder="Pilih agama"
              data={[
                { value: "ISLAM", label: "Islam" },
                { value: "KRISTEN_PROTESTAN", label: "Kristen Protestan" },
                { value: "KRISTEN_KATOLIK", label: "Kristen Katolik" },
                { value: "HINDU", label: "Hindu" },
                { value: "BUDDHA", label: "Buddha" },
                { value: "KONGHUCU", label: "Konghucu" },
                { value: "LAINNYA", label: "Lainnya" },
              ]}
              onChange={(val) => {
                if (val) beasiswaDesa.create.form.agama = val as
                  "ISLAM"
                  | "KRISTEN_PROTESTAN"
                  | "KRISTEN_KATOLIK"
                  | "HINDU"
                  | "BUDDHA"
                  | "KONGHUCU"
                  | "LAINNYA";
              }}
            />
            <TextInput
              label={<Text fz={"sm"} fw={"bold"}>Alamat KTP</Text>}
              placeholder="masukkan alamat ktp"
              onChange={(val) => {
                beasiswaDesa.create.form.alamatKTP = val.target.value
              }}
            />
            <TextInput
              label={<Text fz={"sm"} fw={"bold"}>Alamat Domisili</Text>}
              placeholder="masukkan alamat domisili"
              onChange={(val) => {
                beasiswaDesa.create.form.alamatDomisili = val.target.value
              }}
            />
            <TextInput
              type='number'
              label={<Text fz={"sm"} fw={"bold"}>No Hp</Text>}
              placeholder="masukkan no hp"
              onChange={(val) => {
                beasiswaDesa.create.form.noHp = val.target.value
              }}
            />
            <TextInput
              type='email'
              label={<Text fz={"sm"} fw={"bold"}>Email</Text>}
              placeholder="masukkan email"
              onChange={(val) => {
                beasiswaDesa.create.form.email = val.target.value
              }}
            />
            <Select
              label={<Text fz={"sm"} fw={"bold"}>Status Pernikahan</Text>}
              placeholder="Pilih status pernikahan"
              data={[
                { value: "BELUM_MENIKAH", label: "Belum Menikah" },
                { value: "MENIKAH", label: "Menikah" },
                { value: "JANDA_DUDA", label: "Janda/Duda" },
              ]}
              onChange={(val) => {
                if (val) beasiswaDesa.create.form.statusPernikahan = val as
                  "BELUM_MENIKAH"
                  | "MENIKAH"
                  | "JANDA_DUDA";
              }}
            />
            <Select
              label={<Text fz={"sm"} fw={"bold"}>Ukuran Baju</Text>}
              placeholder="Pilih ukuran baju"
              data={[
                { value: "S", label: "S" },
                { value: "M", label: "M" },
                { value: "L", label: "L" },
                { value: "XL", label: "XL" },
                { value: "XXL", label: "XXL" },
                { value: "LAINNYA", label: "Lainnya" },
              ]}
              onChange={(val) => {
                if (val) beasiswaDesa.create.form.ukuranBaju = val as
                  "S"
                  | "M"
                  | "L"
                  | "XL"
                  | "XXL"
                  | "LAINNYA";
              }}
            />
            <Button bg={colors['blue-button']} onClick={handleSubmit}>Simpan</Button>
          </Stack>
        </Paper>
      </Modal>
    </Stack>
  );
}

export default Page;
