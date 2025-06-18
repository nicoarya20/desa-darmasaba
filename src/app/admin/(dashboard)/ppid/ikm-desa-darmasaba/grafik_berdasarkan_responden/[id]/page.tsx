/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import React, { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import grafikBerdasarkanResponden from '@/app/admin/(dashboard)/_state/ppid/indeks_kepuasan_masyarakat/grafikBerdasarkanResponden';
import colors from '@/con/colors';
import { Box, Button, Paper, Stack, Title, TextInput } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';

function EditGrafikBerdasarkanResponden() {
  const router = useRouter()
  const params = useParams() as { id: string }
  const stateGrafikResponden = useProxy(grafikBerdasarkanResponden)
  const id = params.id

  useEffect(() => {
    if(id){
      stateGrafikResponden.findUnique.load(id).then(() => {
        const data = stateGrafikResponden.findUnique.data
        if(data){
          stateGrafikResponden.update.form = {
            sangatbaik: data.sangatbaik || '',
            baik: data.baik || '',
            kurangbaik: data.kurangbaik || '',
            tidakbaik: data.tidakbaik || '',
          }
        }
      })
    }
  }, [id])

  const handleSubmit = async () => {
    stateGrafikResponden.update.id = id;
    await stateGrafikResponden.update.submit();
    router.push('/admin/ppid/ikm-desa-darmasaba/grafik_berdasarkan_responden')
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
             label="Sangat Baik"
             type='number'
             placeholder="masukkan jumlah"
             value={stateGrafikResponden.update.form.sangatbaik}
             onChange={(val) => {
               stateGrafikResponden.update.form.sangatbaik = val.currentTarget.value;
             }}
           />
           <TextInput
             label="Baik"
             type="number"
             placeholder="masukkan jumlah"
             value={stateGrafikResponden.update.form.baik}
             onChange={(val) => {
               stateGrafikResponden.update.form.baik = val.currentTarget.value;
             }}
           />
           <TextInput
             label="Kurang Baik"
             type="number"
             placeholder="masukkan jumlah"
             value={stateGrafikResponden.update.form.kurangbaik}
             onChange={(val) => {
               stateGrafikResponden.update.form.kurangbaik = val.currentTarget.value;
             }}
           />
           <TextInput
             label="Tidak Baik"
             type="number"
             placeholder="masukkan jumlah"
             value={stateGrafikResponden.update.form.tidakbaik}
             onChange={(val) => {
               stateGrafikResponden.update.form.tidakbaik = val.currentTarget.value;
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

export default EditGrafikBerdasarkanResponden;
