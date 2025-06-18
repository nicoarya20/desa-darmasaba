/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import grafikHasilKepuasanMasyarakat from '@/app/admin/(dashboard)/_state/ppid/indeks_kepuasan_masyarakat/grafikHasilKepuasan';
import colors from '@/con/colors';
import { Box, Button, Paper, Stack, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter, useParams } from 'next/navigation';
import { useEffect } from 'react';
import { useProxy } from 'valtio/utils';

function EditGrafikHasilKepuasan() {
  const router = useRouter()
  const params = useParams() as { id: string }
  const grafikHasilKepuasan = useProxy(grafikHasilKepuasanMasyarakat)

  const id = params.id

  // Load data saat komponen mount
  useEffect(() => {
    if (id) {
      grafikHasilKepuasan.findUnique.load(id).then(() => {
        const data = grafikHasilKepuasan.findUnique.data
        if (data) {
          grafikHasilKepuasan.update.form = {
            label: data.label || '',
            kepuasan: data.kepuasan || '',
          }
        }
      })
    }
  }, [id])

  const handleSubmit = async () => {
    // Set the ID before submitting
    grafikHasilKepuasan.update.id = id;
    await grafikHasilKepuasan.update.submit();
    router.push('/admin/ppid/ikm-desa-darmasaba/grafik_hasil_kepuasan_masyarakat')
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
          <Title order={3}>Edit Grafik Hasil Kepuasan Masyarakat</Title>
          <TextInput
            label="Label"
            placeholder="masukkan label"
            value={grafikHasilKepuasan.update.form.label}
            onChange={(val) => {
              grafikHasilKepuasan.update.form.label = val.currentTarget.value;
            }}
          />
          <TextInput
            label="Jumlah Kepuasan"
            type="number"
            placeholder="masukkan jumlah kepuasan"
            value={grafikHasilKepuasan.update.form.kepuasan}
            onChange={(val) => {
              grafikHasilKepuasan.update.form.kepuasan = val.currentTarget.value;
            }}
          />
          <Button
            mt={10}
            bg={colors['blue-button']}
            onClick={handleSubmit}
          >
            Simpan Perubahan
          </Button>
        </Stack>
      </Paper>
    </Box>
  )
}

export default EditGrafikHasilKepuasan;
