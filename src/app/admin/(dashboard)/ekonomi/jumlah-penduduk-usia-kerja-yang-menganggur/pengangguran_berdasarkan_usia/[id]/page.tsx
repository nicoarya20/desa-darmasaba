'use client'
import grafikNganggur from '@/app/admin/(dashboard)/_state/ekonomi/usia-kerja-nganggur';
/* eslint-disable react-hooks/exhaustive-deps */

import colors from '@/con/colors';
import { Box, Button, Paper, Stack, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useProxy } from 'valtio/utils';

function EditGrafikBerdasarkanUsiaKerjaYangMenganggur() {
  const router = useRouter()
  const params = useParams() as { id: string }
  const stategrafik = useProxy(grafikNganggur.grafikBerdasarkanUsiaKerjaNganggur)
  const id = params.id

  useEffect(() => {
    if(id){
      stategrafik.findUnique.load(id).then(() => {
        const data = stategrafik.findUnique.data
        if(data){
          stategrafik.update.form = {
            usia18_25: data.usia18_25 || '',
            usia26_35: data.usia26_35 || '',
            usia36_45: data.usia36_45 || '',
            usia46_keatas: data.usia46_keatas || '',
          }
        }
      })
    }
  }, [id])

  const handleSubmit = async () => {
    stategrafik.update.id = id;
    await stategrafik.update.submit();
    router.push('/admin/ekonomi/jumlah-penduduk-usia-kerja-yang-menganggur/pengangguran_berdasarkan_usia')
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
        <Title order={3}>Edit Grafik Pengangguran Berdasarkan Usia Kerja</Title>
        <TextInput
          label="Usia 18 - 25"
          type='number'
          placeholder="masukkan jumlah"
          value={stategrafik.update.form.usia18_25}
          onChange={(val) => {
            stategrafik.update.form.usia18_25 = val.currentTarget.value;
          }}
        />
        <TextInput
          label="Usia 26 - 35"
          type="number"
          placeholder="masukkan jumlah"
          value={stategrafik.update.form.usia26_35}
          onChange={(val) => {
            stategrafik.update.form.usia26_35 = val.currentTarget.value;
          }}
        />
        <TextInput
          label="Usia 36 - 45"
          type="number"
          placeholder="masukkan jumlah"
          value={stategrafik.update.form.usia36_45}
          onChange={(val) => {
            stategrafik.update.form.usia36_45 = val.currentTarget.value;
          }}
        />
        <TextInput
          label="Usia 46 +"
          type="number"
          placeholder="masukkan jumlah"
          value={stategrafik.update.form.usia46_keatas}
          onChange={(val) => {
            stategrafik.update.form.usia46_keatas = val.currentTarget.value;
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

export default EditGrafikBerdasarkanUsiaKerjaYangMenganggur;
