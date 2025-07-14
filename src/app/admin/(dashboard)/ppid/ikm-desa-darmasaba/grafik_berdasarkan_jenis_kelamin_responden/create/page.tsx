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

function GrafikBerdasarkanJenisKelaminRespondenCreate() {
  const router = useRouter();
  const stategrafikBerdasarkanJenisKelamin = useProxy(grafikBerdasarkanJenisKelamin)
  const [donutData, setDonutData] = useState<any[]>([]);

  const resetForm = () => {
    stategrafikBerdasarkanJenisKelamin.create.form = {
      ...stategrafikBerdasarkanJenisKelamin.create.form,
      laki: "",
      perempuan: "",
    }
  }

  const handleSubmit = async () => {
    try {
      const id = await stategrafikBerdasarkanJenisKelamin.create.create();
      if (typeof id !== 'undefined') {
        const idStr = String(id);
        await stategrafikBerdasarkanJenisKelamin.findUnique.load(idStr);
        if (stategrafikBerdasarkanJenisKelamin.findUnique.data) {
          setDonutData([stategrafikBerdasarkanJenisKelamin.findUnique.data]);
        }
      }
      resetForm();
      router.push("/admin/ppid/ikm-desa-darmasaba/grafik_berdasarkan_jenis_kelamin_responden");
    } catch (error) {
      console.error('Error submitting form:', error);
    }
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
           <Title order={3}>Grafik Hasil Kepuasan Masyarakat Terhadap Pelayanan Publik</Title>
           <TextInput
             label="Laki-laki"
             type='number'
             placeholder="masukkan jumlah"
             value={stategrafikBerdasarkanJenisKelamin.create.form.laki}
             onChange={(val) => {
               stategrafikBerdasarkanJenisKelamin.create.form.laki = val.currentTarget.value;
             }}
           />
           <TextInput
             label="Perempuan"
             type="number"
             placeholder="masukkan jumlah"
             value={stategrafikBerdasarkanJenisKelamin.create.form.perempuan}
             onChange={(val) => {
               stategrafikBerdasarkanJenisKelamin.create.form.perempuan = val.currentTarget.value;
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

export default GrafikBerdasarkanJenisKelaminRespondenCreate;
