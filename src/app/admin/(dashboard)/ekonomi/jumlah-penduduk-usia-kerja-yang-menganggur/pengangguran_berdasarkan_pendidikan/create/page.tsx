'use client'
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { useRouter } from 'next/navigation';
import grafikBerdasarkanJenisKelamin from '@/app/admin/(dashboard)/_state/ppid/indeks_kepuasan_masyarakat/grafikBerdasarkanJenisKelamin';
import { useProxy } from 'valtio/utils';
import { useState } from 'react';
import colors from '@/con/colors';
import { Box, Button, Paper, Stack, Title, TextInput } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import grafikNganggur from '@/app/admin/(dashboard)/_state/ekonomi/usia-kerja-nganggur';


function CreateGrafikBerdasarkanPendidikan() {
  const router = useRouter();
  const stategrafik = useProxy(grafikNganggur.grafikBerdasarkanPendidikan)
  const [donutData, setDonutData] = useState<any[]>([]);

  const resetForm = () => {
    stategrafik.create.form = {
      ...stategrafik.create.form,
      SD: "",
      SMP: "",
      SMA: "",
      D3: "",
      S1: "",
    }
  }

  const handleSubmit = async () => {
    const id = await stategrafik.create.create();
    if (id) {
      const idStr = String(id);
      await stategrafik.findUnique.load(idStr);
      if (stategrafik.findUnique.data) {
        setDonutData([stategrafik.findUnique.data]);
      }
    }
    resetForm();
    router.push("/admin/ekonomi/jumlah-penduduk-usia-kerja-yang-menganggur/pengangguran_berdasarkan_pendidikan")
  }
  return (
    <Box>
       <Box mb={10}>
         <Button variant="subtle" onClick={() => router.back()}>
           <IconArrowBack size={20} />
         </Button>
       </Box>
       <Paper bg={colors['white-1']} w={{ base: '100%', md: '50%' }} p={'md'}>
         <Stack>
           <Title order={3}>Create Grafik Pengangguran Berdasarkan Pendidikan</Title>
           <TextInput
             label="SD"
             type='number'
             placeholder="masukkan jumlah"
             value={stategrafik.create.form.SD}
             onChange={(val) => {
               stategrafik.create.form.SD = val.currentTarget.value;
             }}
           />
           <TextInput
             label="SMP"
             type="number"
             placeholder="masukkan jumlah"
             value={stategrafik.create.form.SMP}
             onChange={(val) => {
               stategrafik.create.form.SMP = val.currentTarget.value;
             }}
           />
           <TextInput
             label="SMA"
             type="number"
             placeholder="masukkan jumlah"
             value={stategrafik.create.form.SMA}
             onChange={(val) => {
               stategrafik.create.form.SMA = val.currentTarget.value;
             }}
           />
           <TextInput
             label="D3"
             type="number"
             placeholder="masukkan jumlah"
             value={stategrafik.create.form.D3}
             onChange={(val) => {
               stategrafik.create.form.D3 = val.currentTarget.value;
             }}
           />
           <TextInput
             label="S1"
             type="number"
             placeholder="masukkan jumlah"
             value={stategrafik.create.form.S1}
             onChange={(val) => {
               stategrafik.create.form.S1 = val.currentTarget.value;
             }}
           />
           <Button
             mt={10}
             bg={colors['blue-button']}
             onClick={handleSubmit}
           >
             Submit
           </Button>
         </Stack>
       </Paper>
     </Box>
  );
}

export default CreateGrafikBerdasarkanPendidikan;
