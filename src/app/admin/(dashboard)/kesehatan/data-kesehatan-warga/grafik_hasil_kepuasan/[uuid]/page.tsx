/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import grafikkepuasan from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/grafikKepuasan';
import colors from '@/con/colors';
import { Box, Button, Paper, Stack, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useProxy } from 'valtio/utils';

function EditGrafikHasilKepuasan() {
  const router = useRouter()
  const params = useParams() as { uuid: string }
  const stateGrafikKepuasan = useProxy(grafikkepuasan)

  const uuid = params.uuid

  // Load data saat komponen mount
  useEffect(() => {
    if (uuid) {
      stateGrafikKepuasan.findUnique.load(uuid).then(() => {
        const data = stateGrafikKepuasan.findUnique.data
        if (data) {
          stateGrafikKepuasan.update.form = {
            label: data.label || '',
            jumlah: data.jumlah || '',
          }
        }
      })
    }
  }, [uuid])

  const handleSubmit = async () => {
    // Set the ID before submitting
    stateGrafikKepuasan.update.uuid = uuid;
    await stateGrafikKepuasan.update.submit();
    router.push('/admin/kesehatan/data-kesehatan-warga/grafik_hasil_kepuasan')
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
          <Title order={3}>Edit Grafik Hasil Kepuasan</Title>
          <TextInput
            label="Label"
            placeholder="masukkan label"
            value={stateGrafikKepuasan.update.form.label}
            onChange={(val) => {
              stateGrafikKepuasan.update.form.label = val.currentTarget.value;
            }}
          />
          <TextInput
            label="Jumlah"
            type="number"
            placeholder="masukkan jumlah"
            value={stateGrafikKepuasan.update.form.jumlah}
            onChange={(val) => {
              stateGrafikKepuasan.update.form.jumlah = val.currentTarget.value;
            }}
          />
          <Button
            mt={10}
            bg={colors['blue-button']}
            onClick={handleSubmit}
          >
            Simpan
          </Button>
        </Stack>
      </Paper>
    </Box>
  )
}

export default EditGrafikHasilKepuasan;
