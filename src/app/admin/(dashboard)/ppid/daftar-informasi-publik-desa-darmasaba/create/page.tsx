'use client'
import colors from '@/con/colors';
import { Box, Button, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import CreateEditor from '../../../_com/createEditor';
import daftarInformasiPublik from '../../../_state/ppid/daftar_informasi_publik/daftarInformasiPublik';

export default function CreateBerita() {
  const daftarInformasi = useProxy(daftarInformasiPublik)
  const router = useRouter()

  const resetForm = () => {
    // Reset state di valtio
    daftarInformasi.create.form = {
      jenisInformasi: "",
      deskripsi: "",
      tanggal: "",
    };

    // Reset state lokal
  };

  const handleSubmit = async () => {
    // Submit data berita
    await daftarInformasi.create.create();

    // Reset form setelah submit
    resetForm();
    router.push("/admin/ppid/daftar-informasi-publik-desa-darmasaba")
  };

  return (
    <Box>
      <Box mb={10}>
        <Button variant="subtle" onClick={() => router.back()}>
          <IconArrowBack color={colors['blue-button']} size={25} />
        </Button>
      </Box>
      <Paper bg={colors["white-1"]} p={"md"} w={{ base: "100%", md: "50%" }}>
        <Stack gap={"xs"}>
          <Title order={3}>Create Daftar Informasi Publik Desa Darmasaba</Title>
          <TextInput
            label="Jenis Informasi"
            placeholder="masukkan jenis informasi"
            onChange={(val) => {
              daftarInformasi.create.form.jenisInformasi = val.target.value
            }}
          />
          <Box>
            <Text fz={"sm"} fw={"bold"}>Deskripsi</Text>
            <CreateEditor
              value={daftarInformasi.create.form.deskripsi}
              onChange={(htmlContent) => {
                daftarInformasi.create.form.deskripsi = htmlContent;
              }}
            />
          </Box>
          <TextInput
            label="Tanggal Publikasi"
            placeholder="masukkan tanggal publikasi"
            onChange={(val) => {
              daftarInformasi.create.form.tanggal = val.target.value
            }}
          />
          <Button bg={colors['blue-button']} onClick={handleSubmit}>Simpan Berita</Button>
        </Stack>
      </Paper>
    </Box>
  );
}
