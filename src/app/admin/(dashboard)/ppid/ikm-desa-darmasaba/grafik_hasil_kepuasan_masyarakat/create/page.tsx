/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import grafikHasilKepuasanMasyarakat from '@/app/admin/(dashboard)/_state/ppid/indeks_kepuasan_masyarakat/grafikHasilKepuasan';
import colors from '@/con/colors';
import { Box, Button, Paper, Stack, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';


function GrafikHasilKepuasan() {
 const router = useRouter()
 const grafikHasilKepuasan = useProxy(grafikHasilKepuasanMasyarakat)
 const [chartData, setChartData] = useState<any[]>([]);


const resetForm = () => {
  grafikHasilKepuasan.create.form = {
    ...grafikHasilKepuasan.create.form,
    label: "",
    kepuasan: "",
  }
}

const handleSubmit = async () => {
  const id = await grafikHasilKepuasan.create.create();
  if (id) {
    // Ensure id is a string
    const idStr = String(id);
    await grafikHasilKepuasan.findUnique.load(idStr);
    if (grafikHasilKepuasan.findUnique.data) {
      setChartData([grafikHasilKepuasan.findUnique.data]);
    }
  }
  resetForm();
  router.push("/admin/ppid/ikm-desa-darmasaba/grafik_hasil_kepuasan_masyarakat")
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
             label="Label"
             placeholder="masukkan label"
             value={grafikHasilKepuasan.create.form.label}
             onChange={(val) => {
               grafikHasilKepuasan.create.form.label = val.currentTarget.value;
             }}
           />
           <TextInput
             label="Jumlah Kepuasan"
             type="number"
             placeholder="masukkan jumlah kepuasan"
             value={grafikHasilKepuasan.create.form.kepuasan}
             onChange={(val) => {
               grafikHasilKepuasan.create.form.kepuasan = val.currentTarget.value;
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


export default GrafikHasilKepuasan;