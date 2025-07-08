'use client'
import grafikNganggur from '@/app/admin/(dashboard)/_state/ekonomi/usia-kerja-nganggur';
/* eslint-disable react-hooks/exhaustive-deps */

import colors from '@/con/colors';
import { Box, Button, Paper, Stack, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useProxy } from 'valtio/utils';

function EditGrafikBerdasarkanPendidikan() {
  const router = useRouter()
  const params = useParams() as { id: string }
  const stategrafik = useProxy(grafikNganggur.grafikBerdasarkanPendidikan)
  const id = params.id

  useEffect(() => {
    if(id){
      stategrafik.findUnique.load(id).then(() => {
        const data = stategrafik.findUnique.data
        if(data){
          stategrafik.update.form = {
            SD: data.SD || '',
            SMP: data.SMP || '',
            SMA: data.SMA || '',
            D3: data.D3 || '',
            S1: data.S1 || '',
          }
        }
      })
    }
  }, [id])

  const handleSubmit = async () => {
    stategrafik.update.id = id;
    await stategrafik.update.submit();
    router.push('/admin/ekonomi/jumlah-penduduk-usia-kerja-yang-menganggur/pengangguran_berdasarkan_pendidikan')
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
        <Title order={3}>Edit Grafik Pengangguran Berdasarkan Pendidikan</Title>
        <TextInput
          label="SD"
          type='number'
          placeholder="masukkan jumlah"
          value={stategrafik.update.form.SD}
          onChange={(val) => {
            stategrafik.update.form.SD = val.currentTarget.value;
          }}
        />
        <TextInput
          label="SMP"
          type="number"
          placeholder="masukkan jumlah"
          value={stategrafik.update.form.SMP}
          onChange={(val) => {
            stategrafik.update.form.SMP = val.currentTarget.value;
          }}
        />
        <TextInput
          label="SMA"
          type="number"
          placeholder="masukkan jumlah"
          value={stategrafik.update.form.SMA}
          onChange={(val) => {
            stategrafik.update.form.SMA = val.currentTarget.value;
          }}
        />
        <TextInput
          label="D3"
          type="number"
          placeholder="masukkan jumlah"
          value={stategrafik.update.form.D3}
          onChange={(val) => {
            stategrafik.update.form.D3 = val.currentTarget.value;
          }}
        />
        <TextInput
          label="S1"
          type="number"
          placeholder="masukkan jumlah"
          value={stategrafik.update.form.S1}
          onChange={(val) => {
            stategrafik.update.form.S1 = val.currentTarget.value;
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

export default EditGrafikBerdasarkanPendidikan;
