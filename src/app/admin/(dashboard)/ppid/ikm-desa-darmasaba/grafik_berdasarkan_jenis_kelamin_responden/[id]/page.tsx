'use client'
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import grafikBerdasarkanJenisKelamin from '@/app/admin/(dashboard)/_state/ppid/indeks_kepuasan_masyarakat/grafikBerdasarkanJenisKelamin';
import colors from '@/con/colors';
import { Box, Button, Paper, Stack, Title, TextInput } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';

function EditGrafikBerdasarkanJenisKelaminResponden() {
  const router = useRouter()
  const params = useParams() as { id: string }
  const stategrafikBerdasarkanJenisKelamin = useProxy(grafikBerdasarkanJenisKelamin)
  const id = params.id

  useEffect(() => {
    if(id){
      stategrafikBerdasarkanJenisKelamin.findUnique.load(id).then(() => {
        const data = stategrafikBerdasarkanJenisKelamin.findUnique.data
        if(data){
          stategrafikBerdasarkanJenisKelamin.update.form = {
            laki: data.laki || '',
            perempuan: data.perempuan || '',
          }
        }
      })
    }
  }, [id])

  const handleSubmit = async () => {
    stategrafikBerdasarkanJenisKelamin.update.id = id;
    await stategrafikBerdasarkanJenisKelamin.update.submit();
    router.push('/admin/ppid/ikm-desa-darmasaba/grafik_berdasarkan_jenis_kelamin_responden')
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
          value={stategrafikBerdasarkanJenisKelamin.update.form.laki}
          onChange={(val) => {
            stategrafikBerdasarkanJenisKelamin.update.form.laki = val.currentTarget.value;
          }}
        />
        <TextInput
          label="Perempuan"
          type="number"
          placeholder="masukkan jumlah"
          value={stategrafikBerdasarkanJenisKelamin.update.form.perempuan}
          onChange={(val) => {
            stategrafikBerdasarkanJenisKelamin.update.form.perempuan = val.currentTarget.value;
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

export default EditGrafikBerdasarkanJenisKelaminResponden;
