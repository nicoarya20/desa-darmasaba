'use client'
/* eslint-disable react-hooks/exhaustive-deps */
import grafikBerdasarkanUmur from '@/app/admin/(dashboard)/_state/ppid/indeks_kepuasan_masyarakat/grafikBerdasarkanUmur';
import colors from '@/con/colors';
import { Box, Button, Paper, Stack, Title, TextInput } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { useProxy } from 'valtio/utils';

function EditGrafikBerdasarakanUmur() {
  const router = useRouter()
  const params = useParams() as { id: string }
  const stategrafikBerdasarkanUmur = useProxy(grafikBerdasarkanUmur)
  const id = params.id

  useEffect(() => {
    if(id){
      stategrafikBerdasarkanUmur.findUnique.load(id).then(() => {
        const data = stategrafikBerdasarkanUmur.findUnique.data
        if(data){
          stategrafikBerdasarkanUmur.update.form = {
            remaja: data.remaja || '',
            dewasa: data.dewasa || '',
            orangtua: data.orangtua || '',
            lansia: data.lansia || '',
          }
        }
      })
    }
  }, [id])

  const handleSubmit = async () => {
    stategrafikBerdasarkanUmur.update.id = id;
    await stategrafikBerdasarkanUmur.update.submit();
    router.push('/admin/ppid/ikm-desa-darmasaba/grafik_berdasarkan_umur')
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
          label="Remaja"
          type='number'
          placeholder="masukkan jumlah"
          value={stategrafikBerdasarkanUmur.update.form.remaja}
          onChange={(val) => {
            stategrafikBerdasarkanUmur.update.form.remaja = val.currentTarget.value;
          }}
        />
        <TextInput
          label="Dewasa"
          type="number"
          placeholder="masukkan jumlah"
          value={stategrafikBerdasarkanUmur.update.form.dewasa}
          onChange={(val) => {
            stategrafikBerdasarkanUmur.update.form.dewasa = val.currentTarget.value;
          }}
        />
        <TextInput
          label="Orangtua"
          type='number'
          placeholder="masukkan jumlah"
          value={stategrafikBerdasarkanUmur.update.form.orangtua}
          onChange={(val) => {
            stategrafikBerdasarkanUmur.update.form.orangtua = val.currentTarget.value;
          }}
        />
        <TextInput
          label="Lansia"
          type="number"
          placeholder="masukkan jumlah"
          value={stategrafikBerdasarkanUmur.update.form.lansia}
          onChange={(val) => {
            stategrafikBerdasarkanUmur.update.form.lansia = val.currentTarget.value;
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

export default EditGrafikBerdasarakanUmur;
