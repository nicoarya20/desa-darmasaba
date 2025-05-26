'use client'
import statePermohonanInformasi from '@/app/admin/(dashboard)/_state/ppid/permohonan_informasi_publik/permohonanInformasiPublik';
import colors from '@/con/colors';
import { ActionIcon, Box, Button, Center, Checkbox, Group, Paper, SimpleGrid, Stack, Text, TextInput } from '@mantine/core';
import { IconDownload } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import BackButton from '../../desa/layanan/_com/BackButto';
import JenisInformasiSelector from './jenis_infromasi/jenisInformasiSelector';
import MemperolehInformasi from './memperoleh_informasi/memperolehInfromasi';
import MemperolehSalinan from './salinan_informasi/salinanInformasi';

const data = [
  { id: 1, number: '1', title: "Langkah 1", desc: "Pemohon informasi publik mengajukan permohonan informasi kepada badan publik baik langsung maupun melalui surat elektronik" },
  { id: 2, number: '2', title: "Langkah 2", desc: "Isi formulir permohonan informasi dengan data diri (nama, alamat, telepon), jenis, format, dan cara penyampaian informasi, serta lampiran fotokopi kartu identitas." },
  { id: 3, number: '3', title: "Langkah 3", desc: "PPID akan memproses permohonan sesuai dengan ketentuan" },
  { id: 4, number: '4', title: "Langkah 4", desc: "Petugas PPID menyampaikan informasi sesuai permohonan kepada pemohon informasi." },
];

function Page() {
  const permohonanInformasiPublikState = useProxy(statePermohonanInformasi);
  const router = useRouter();

  const submitForms = () => {
    const { create } = permohonanInformasiPublikState.statepermohonanInformasiPublik;

    if (create.form.name && create.form.nik && create.form.notelp && create.form.alamat && create.form.email &&
      create.form.jenisInformasiDimintaId && create.form.caraMemperolehInformasiId && create.form.caraMemperolehSalinanInformasiId) {
      create.create();
      router.push('/darmasaba/permohonan/berhasil');
    } else {
      console.log("Validasi gagal, form tidak lengkap");
      // Display error message to user
    }
  };

  return (
    <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"22"}>
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>
      <Text ta={"center"} fz={{ base: "h1", md: "2.5rem" }} c={colors["blue-button"]} fw={"bold"}>
        Permohonan Informasi Publik
      </Text>
      <Box px={{ base: "md", md: 100 }}>
        <Stack gap={'lg'}>
          <Paper p={"xl"} bg={colors['white-trans-1']}>
            <Text pb={30} ta={'center'} fw={"bold"} fz={{ base: 'h3', md: 'h2' }}>Tata Cara Permohonan</Text>
            <SimpleGrid pb={30} cols={{ base: 1, md: 2, lg: 3, xl: 4 }}>
              {data.map((v, k) => (
                <Paper key={k} p={"xl"} bg={colors['blue-button']}>
                  <Stack justify='space-between'>
                    <Center>
                      <ActionIcon bg={colors['white-1']} radius={150} size={50}>
                        <Text c={colors['blue-button']} ta={"center"} fw={"bold"} fz={{ base: "h3", md: "h2" }}>{v.number}</Text>
                      </ActionIcon>
                    </Center>
                    <Text ta={"center"} c={colors['white-1']} fw={"bold"} fz={"h3"}>{v.title}</Text>
                    <Text ta={"center"} c={colors['white-1']} fz={'h4'}>{v.desc}</Text>
                  </Stack>
                </Paper>
              ))}
            </SimpleGrid>
            <Center pb={30}>
              <Button fz={"h5"} bg={colors['blue-button']} leftSection={<IconDownload size={20} color={colors['white-1']} />}>
                Unduh Dokumen
              </Button>
            </Center>
            <Group justify='center'>
              <Paper p={'xl'} bg={colors['white-1']}>
                <Stack gap={"xs"}>
                  <Text fw={"bold"} fz={{ base: 'h4', md: 'h3' }} ta={"center"}>Formulir Permohonan Informasi</Text>
                  <TextInput label="Nama Lengkap" placeholder="masukkan nama lengkap" onChange={(val) => {
                    permohonanInformasiPublikState.statepermohonanInformasiPublik.create.form.name = val.target.value;
                  }} />
                  <TextInput label="NIK" placeholder="masukkan NIK" onChange={(val) => {
                    permohonanInformasiPublikState.statepermohonanInformasiPublik.create.form.nik = val.target.value;
                  }} />
                  <TextInput label="No.Telp" placeholder="masukkan no telp" onChange={(val) => {
                    permohonanInformasiPublikState.statepermohonanInformasiPublik.create.form.notelp = val.target.value;
                  }} />
                  <TextInput label="Alamat" placeholder="masukkan alamat" onChange={(val) => {
                    permohonanInformasiPublikState.statepermohonanInformasiPublik.create.form.alamat = val.target.value;
                  }} />
                  <TextInput label="Email" placeholder="masukkan email" onChange={(val) => {
                    permohonanInformasiPublikState.statepermohonanInformasiPublik.create.form.email = val.target.value;
                  }} />
                  <JenisInformasiSelector
                    onChange={(val) => {
                      permohonanInformasiPublikState.statepermohonanInformasiPublik.create.form.jenisInformasiDimintaId = val.id;
                    }}
                  />
                  <MemperolehInformasi 
                    onChange={(val) => {
                      permohonanInformasiPublikState.statepermohonanInformasiPublik.create.form.caraMemperolehInformasiId = val.id;
                    }} 
                  />
                  <MemperolehSalinan 
                    onChange={(val) => {
                      permohonanInformasiPublikState.statepermohonanInformasiPublik.create.form.caraMemperolehSalinanInformasiId = val.id;
                    }} 
                  />
                  <Box py={10}>
                    <Checkbox label="Saya menyatakan bahwa informasi yang saya berikan adalah benar dan akan menggunakan informasi yang diminta" />
                  </Box>
                  <Group>
                    <Button bg={colors['blue-button']} onClick={submitForms}>Kirim Permohonan</Button>
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