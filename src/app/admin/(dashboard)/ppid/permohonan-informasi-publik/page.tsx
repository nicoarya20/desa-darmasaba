'use client'
import { Box, Button, Group, Paper, SimpleGrid, Stack, TextInput, Title } from '@mantine/core';
import { useProxy } from 'valtio/utils';
import statePermohonanInformasi from '../../_state/ppid/permohonan_informasi_publik/permohonanInformasiPublik';
import JenisInformasi from './jenisInformasi';
import MemperolehInformasi from './memperolehInformasi';
import MemperolehSalinan from './memperolehSalinan';
import colors from '@/con/colors';

function Page() {
  return (
    <Box>
      <Stack>
        <SimpleGrid cols={{ base: 1, md: 2 }}>
          <PermohonanInformasiPublikCreate />
        </SimpleGrid>
      </Stack>
    </Box>
  );
}

function PermohonanInformasiPublikCreate() {
  const permohonanInformasiPublikState = useProxy(statePermohonanInformasi)
  const submitForms = () => {
    // Tambahkan log untuk debugging
    console.log("Form data sebelum submit:", {
      name: permohonanInformasiPublikState.permohonanInformasiPublikForm.create.form.name,
      nik: permohonanInformasiPublikState.permohonanInformasiPublikForm.create.form.nik,
      notelp: permohonanInformasiPublikState.permohonanInformasiPublikForm.create.form.notelp,
      alamat: permohonanInformasiPublikState.permohonanInformasiPublikForm.create.form.alamat,
      email: permohonanInformasiPublikState.permohonanInformasiPublikForm.create.form.email,
      jenisInformasiDimintaId: permohonanInformasiPublikState.jenisInformasiDiminta,
      caraMemperolehInformasiId: permohonanInformasiPublikState.caraMemperolehInformasi,
      caraMemperolehSalinanInformasiId: permohonanInformasiPublikState.caraMemperolehSalinanInformasi
    });

    if (permohonanInformasiPublikState.permohonanInformasiPublikForm.create.form.name &&
      permohonanInformasiPublikState.permohonanInformasiPublikForm.create.form.nik &&
      permohonanInformasiPublikState.permohonanInformasiPublikForm.create.form.notelp &&
      permohonanInformasiPublikState.permohonanInformasiPublikForm.create.form.alamat &&
      permohonanInformasiPublikState.permohonanInformasiPublikForm.create.form.email &&
      permohonanInformasiPublikState.jenisInformasiDiminta &&
      permohonanInformasiPublikState.caraMemperolehInformasi &&
      permohonanInformasiPublikState.caraMemperolehSalinanInformasi) {
      permohonanInformasiPublikState.permohonanInformasiPublikForm.create.create()
    } else {
      console.log("Validasi gagal, form tidak lengkap");
      // Tampilkan pesan error ke pengguna di sini
    }
  }
  return (
    <Box py={5}>
      <Paper bg={colors['white-1']} p={'md'}>
      <Stack gap={"10"}>
        <Title order={3}>Permohonan Informasi Publik</Title>
        <TextInput
          label="Nama Lengkap"
          placeholder="masukkan nama lengkap"
          onChange={(val) => {
            permohonanInformasiPublikState.permohonanInformasiPublikForm.create.form.name = val.target.value
          }}
        />
        <TextInput
          label="NIK"
          placeholder="masukkan NIK"
          onChange={(val) => {
            permohonanInformasiPublikState.permohonanInformasiPublikForm.create.form.nik = val.target.value
          }}
        />
        <TextInput
          label="No.Telp"
          placeholder="masukkan no telp"
          onChange={(val) => {
            permohonanInformasiPublikState.permohonanInformasiPublikForm.create.form.notelp = val.target.value
          }}
        />
        <TextInput
          label="Alamat"
          placeholder="masukkan alamat"
          onChange={(val) => {
            permohonanInformasiPublikState.permohonanInformasiPublikForm.create.form.alamat = val.target.value
          }}
        />
        <TextInput
          label="Email"
          placeholder="masukkan email"
          onChange={(val) => {
            permohonanInformasiPublikState.permohonanInformasiPublikForm.create.form.email = val.target.value
          }}
        />
        <JenisInformasi
          onChange={(val) => {
            permohonanInformasiPublikState.permohonanInformasiPublikForm.create.form.jenisInformasiDimintaId = val.id
          }}
        />
        <MemperolehInformasi
          onChange={(val) => {
            permohonanInformasiPublikState.permohonanInformasiPublikForm.create.form.caraMemperolehInformasiId = val.id
          }}
        />
        <MemperolehSalinan
          onChange={(val) => {
            permohonanInformasiPublikState.permohonanInformasiPublikForm.create.form.caraMemperolehSalinanInformasiId = val.id
          }}
        />
        <Group>
          <Button onClick={submitForms}>Submit</Button>
        </Group>
      </Stack>
    </Paper>
    </Box >
  )
}

export default Page;