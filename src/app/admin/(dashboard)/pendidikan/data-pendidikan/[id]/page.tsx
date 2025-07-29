/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import colors from '@/con/colors';
import { Box, Button, Paper, Stack, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useProxy } from 'valtio/utils';
import dataPendidikan from '../../../_state/pendidikan/data-pendidikan';

function EditDataPendidikan() {
  const router = useRouter()
  const params = useParams() as { id: string }
  const stateDPM = useProxy(dataPendidikan)

  const id = params.id

  // Load data saat komponen mount
  useEffect(() => {
    if (id) {
      stateDPM.findUnique.load(id).then(() => {
        const data = stateDPM.findUnique.data
        if (data) {
          stateDPM.update.form = {
            name: data.name || "",
            jumlah: data.jumlah || "",
          }
        }
      })
    }
  }, [id])

  const handleSubmit = async () => {
    // Set the ID before submitting
    stateDPM.update.id = id;
    await stateDPM.update.submit();
    router.push('/admin/pendidikan/data-pendidikan')
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
          <Title order={3}>Edit Data Pendidikan</Title>
          <TextInput
            label="Nama"
            placeholder="masukkan nama"
            value={stateDPM.update.form.name}
            onChange={(val) => {
              stateDPM.update.form.name = val.currentTarget.value;
            }}
          />
          <TextInput
            label="Jumlah"
            type="number"
            placeholder="masukkan jumlah"
            value={stateDPM.update.form.jumlah}
            onChange={(val) => {
              stateDPM.update.form.jumlah = val.currentTarget.value;
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

export default EditDataPendidikan;
