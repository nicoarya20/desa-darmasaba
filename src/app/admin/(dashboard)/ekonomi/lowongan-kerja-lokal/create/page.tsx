'use client'
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import CreateEditor from '../../../_com/createEditor';
import lowonganKerjaState from '../../../_state/ekonomi/lowongan-kerja';


function CreateLowonganKerja() {
  const lowonganState = useProxy(lowonganKerjaState)
  const router = useRouter();

  const resetForm = () => {
    lowonganState.create.form = {
      posisi: "",
      namaPerusahaan: "",
      lokasi: "",
      tipePekerjaan: "",
      gaji: "",
      deskripsi: "",
      kualifikasi: "",
    }
  }

  const handleSubmit = async () => {
    await lowonganState.create.create()
    resetForm()
    router.push("/admin/ekonomi/lowongan-kerja-lokal")
  }

  return (
    <Box>
      <Box mb={10}>
        <Button onClick={() => router.back()} variant='subtle' color={'blue'}>
          <IconArrowBack color={colors['blue-button']} size={25}/>
        </Button>
      </Box>

      <Paper w={{base: '100%', md: '50%'}} bg={colors['white-1']} p={'md'}>
        <Stack gap={"xs"}>
          <Title order={4}>Create Lowongan Kerja Lokal</Title>
          <TextInput
          value={lowonganState.create.form.posisi}
          onChange={(val) => {
            lowonganState.create.form.posisi = val.target.value;
          }}
          label={<Text fw={"bold"} fz={"sm"}>Posisi</Text>}
          placeholder='Masukkan posisi'
          />
          <TextInput
          value={lowonganState.create.form.namaPerusahaan}
          onChange={(val) => {
            lowonganState.create.form.namaPerusahaan = val.target.value;
          }}
          label={<Text fw={"bold"} fz={"sm"}>Nama Perusahaan</Text>}
          placeholder='Masukkan nama perusahaan'
          />
          <TextInput
          value={lowonganState.create.form.lokasi}
          onChange={(val) => {
            lowonganState.create.form.lokasi = val.target.value;
          }}
          label={<Text fw={"bold"} fz={"sm"}>Lokasi</Text>}
          placeholder='Masukkan lokasi'
          />
          <TextInput
          value={lowonganState.create.form.tipePekerjaan}
          onChange={(val) => {
            lowonganState.create.form.tipePekerjaan = val.target.value;
          }}
          label={<Text fw={"bold"} fz={"sm"}>Tipe Pekerjaan</Text>}
          placeholder='Masukkan tipe pekerjaan'
          />
          <TextInput
          value={lowonganState.create.form.gaji}
          onChange={(val) => {
            lowonganState.create.form.gaji = val.target.value;
          }}
          label={<Text fw={"bold"} fz={"sm"}>Gaji selama 1 bulan</Text>}
          placeholder='Masukkan gaji'
          />
          <Box>
            <Text fw={"bold"} fz={"sm"}>Deskripsi Lowongan Kerja</Text>
            <CreateEditor
              value={lowonganState.create.form.deskripsi}
              onChange={(val) => {
                lowonganState.create.form.deskripsi = val;
              }}
            />
          </Box>
          <Box>
            <Text fw={"bold"} fz={"sm"}>Kualifikasi Lowongan Kerja</Text>
            <CreateEditor
              value={lowonganState.create.form.kualifikasi}
              onChange={(val) => {
                lowonganState.create.form.kualifikasi = val;
              }}
            />
          </Box>
          <Group>
            <Button bg={colors['blue-button']} onClick={handleSubmit}>Submit</Button>
          </Group>
       </Stack>
      </Paper>
   </Box>
  );
}

export default CreateLowonganKerja;
