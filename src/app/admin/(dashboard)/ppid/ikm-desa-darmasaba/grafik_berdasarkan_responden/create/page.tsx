/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import grafikBerdasarkanResponden from '@/app/admin/(dashboard)/_state/ppid/indeks_kepuasan_masyarakat/grafikBerdasarkanResponden';
import colors from '@/con/colors';
import { Box, Button, Paper, Stack, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';

function GrafikBerdasarkanRespondenCreate() {
  const router = useRouter()
  const stategrafikBerdasarkanResponden = useProxy(grafikBerdasarkanResponden)
  const [donutData, setDonutData] = useState<any[]>([]);

  const resetForm = () => {
    stategrafikBerdasarkanResponden.create.form = {
      ...stategrafikBerdasarkanResponden.create.form,
      sangatbaik: "",
      baik: "",
      kurangbaik: "",
      tidakbaik: "",
    }
  }

  const handleSubmit = async () => {
    const id = await stategrafikBerdasarkanResponden.create.create();
    if (id) {
      const idStr = String(id);
      await stategrafikBerdasarkanResponden.findUnique.load(idStr);
      if (stategrafikBerdasarkanResponden.findUnique.data) {
        setDonutData([stategrafikBerdasarkanResponden.findUnique.data]);
      }
    }
    resetForm();
    router.push("/admin/ppid/ikm-desa-darmasaba/grafik_berdasarkan_responden")
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
           <Title order={3}>Grafik Hasil Kepuasan Masyarakat Berdasarkan Responden</Title>
           <TextInput
             label="Sangat Baik"
             type='number'
             placeholder="masukkan jumlah"
             value={stategrafikBerdasarkanResponden.create.form.sangatbaik}
             onChange={(val) => {
               stategrafikBerdasarkanResponden.create.form.sangatbaik = val.currentTarget.value;
             }}
           />
           <TextInput
             label="Baik"
             type="number"
             placeholder="masukkan jumlah"
             value={stategrafikBerdasarkanResponden.create.form.baik}
             onChange={(val) => {
               stategrafikBerdasarkanResponden.create.form.baik = val.currentTarget.value;
             }}
           />
           <TextInput
             label="Kurang Baik"
             type="number"
             placeholder="masukkan jumlah"
             value={stategrafikBerdasarkanResponden.create.form.kurangbaik}
             onChange={(val) => {
               stategrafikBerdasarkanResponden.create.form.kurangbaik = val.currentTarget.value;
             }}
           />
           <TextInput
             label="Tidak Baik"
             type="number"
             placeholder="masukkan jumlah"
             value={stategrafikBerdasarkanResponden.create.form.tidakbaik}
             onChange={(val) => {
               stategrafikBerdasarkanResponden.create.form.tidakbaik = val.currentTarget.value;
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

export default GrafikBerdasarkanRespondenCreate;
