'use client'
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import grafikBerdasarkanUmur from '@/app/admin/(dashboard)/_state/ppid/indeks_kepuasan_masyarakat/grafikBerdasarkanUmur';
import colors from '@/con/colors';
import { Box, Button, Paper, Stack, Title, TextInput } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useProxy } from 'valtio/utils';

function GrafikBerdasarakanUmurCreate() {
  const stategrafikBerdasarkanUmur = useProxy(grafikBerdasarkanUmur)
  const [donutData, setDonutData] = useState<any[]>([]);
  const router = useRouter()

  const resetForm = () => {
    stategrafikBerdasarkanUmur.create.form = {
      ...stategrafikBerdasarkanUmur.create.form,
      remaja: "",
      dewasa: "",
      orangtua: "",
      lansia: "",
    }
  }

  const handleSubmit = async () => {
    const id = await stategrafikBerdasarkanUmur.create.create();
    if (id) {
      const idStr = String(id);
      await stategrafikBerdasarkanUmur.findUnique.load(idStr);
      if (stategrafikBerdasarkanUmur.findUnique.data) {
        setDonutData([stategrafikBerdasarkanUmur.findUnique.data]);
      }
    }
    resetForm();
    router.push("/admin/ppid/ikm-desa-darmasaba/grafik_berdasarkan_umur")
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
          value={stategrafikBerdasarkanUmur.create.form.remaja}
          onChange={(val) => {
            stategrafikBerdasarkanUmur.create.form.remaja = val.currentTarget.value;
          }}
        />
        <TextInput
          label="Dewasa"
          type="number"
          placeholder="masukkan jumlah"
          value={stategrafikBerdasarkanUmur.create.form.dewasa}
          onChange={(val) => {
            stategrafikBerdasarkanUmur.create.form.dewasa = val.currentTarget.value;
          }}
        />
        <TextInput
          label="Orangtua"
          type="number"
          placeholder="masukkan jumlah"
          value={stategrafikBerdasarkanUmur.create.form.orangtua}
          onChange={(val) => {
            stategrafikBerdasarkanUmur.create.form.orangtua = val.currentTarget.value;
          }}
        />
        <TextInput
          label="Lansia"
          type="number"
          placeholder="masukkan jumlah"
          value={stategrafikBerdasarkanUmur.create.form.lansia}
          onChange={(val) => {
            stategrafikBerdasarkanUmur.create.form.lansia = val.currentTarget.value;
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

export default GrafikBerdasarakanUmurCreate;
