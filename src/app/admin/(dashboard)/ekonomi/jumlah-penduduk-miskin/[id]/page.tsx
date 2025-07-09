/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import jumlahPendudukMiskin from '@/app/admin/(dashboard)/_state/ekonomi/jumlah-penduduk-miskin';
import colors from '@/con/colors';
import { Box, Button, Paper, Stack, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useProxy } from 'valtio/utils';

function EditJumlahPendudukMiskin() {
  const router = useRouter()
  const params = useParams() as { id: string }
  const stateJPM = useProxy(jumlahPendudukMiskin)

  const id = params.id

  // Load data saat komponen mount
  useEffect(() => {
    if (id) {
      stateJPM.findUnique.load(id).then(() => {
        const data = stateJPM.findUnique.data
        if (data) {
          stateJPM.update.form = {
            year: data.year || 0,
            totalPoorPopulation: data.totalPoorPopulation || 0,
          }
        }
      })
    }
  }, [id])

  const handleSubmit = async () => {
    // Set the ID before submitting
    stateJPM.update.id = id;
    await stateJPM.update.submit();
    router.push('/admin/ekonomi/jumlah-penduduk-miskin-2024-2025')
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
          <Title order={3}>Edit Jumlah Penduduk Miskin</Title>
          <TextInput
            label="Tahun"
            placeholder="masukkan tahun"
            value={stateJPM.update.form.year}
            onChange={(val) => {
              stateJPM.update.form.year = Number(val.currentTarget.value);
            }}
          />
          <TextInput
            label="Jumlah Penduduk Miskin"
            type="number"
            placeholder="masukkan jumlah penduduk miskin"
            value={stateJPM.update.form.totalPoorPopulation}
            onChange={(val) => {
              stateJPM.update.form.totalPoorPopulation = Number(val.currentTarget.value);
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

export default EditJumlahPendudukMiskin;
