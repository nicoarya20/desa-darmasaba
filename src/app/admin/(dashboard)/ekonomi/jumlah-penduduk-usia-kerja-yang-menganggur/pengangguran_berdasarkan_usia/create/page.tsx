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


function CreateGrafikBerdasarkanUsiaKerjaYangMenganggur() {
  const router = useRouter();
  const stategrafik = useProxy(grafikNganggur.grafikBerdasarkanUsiaKerjaNganggur)
  const [donutData, setDonutData] = useState<any[]>([]);

  const resetForm = () => {
    stategrafik.create.form = {
      ...stategrafik.create.form,
      usia18_25: "",
      usia26_35: "",
      usia36_45: "",
      usia46_keatas: "",
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
    router.push("/admin/ekonomi/jumlah-penduduk-usia-kerja-yang-menganggur/pengangguran_berdasarkan_usia")
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
           <Title order={3}>Create Grafik Pengangguran Berdasarkan Usia Kerja</Title>
           <TextInput
             label="Usia 18 - 25"
             type='number'
             placeholder="masukkan jumlah"
             value={stategrafik.create.form.usia18_25}
             onChange={(val) => {
               stategrafik.create.form.usia18_25 = val.currentTarget.value;
             }}
           />
           <TextInput
             label="Usia 26 - 35"
             type="number"
             placeholder="masukkan jumlah"
             value={stategrafik.create.form.usia26_35}
             onChange={(val) => {
               stategrafik.create.form.usia26_35 = val.currentTarget.value;
             }}
           />
           <TextInput
             label="Usia 36 - 45"
             type="number"
             placeholder="masukkan jumlah"
             value={stategrafik.create.form.usia36_45}
             onChange={(val) => {
               stategrafik.create.form.usia36_45 = val.currentTarget.value;
             }}
           />
           <TextInput
             label="Usia 46 +"
             type="number"
             placeholder="masukkan jumlah"
             value={stategrafik.create.form.usia46_keatas}
             onChange={(val) => {
               stategrafik.create.form.usia46_keatas = val.currentTarget.value;
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

export default CreateGrafikBerdasarkanUsiaKerjaYangMenganggur;
