/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import grafikSektorUnggulan from '@/app/admin/(dashboard)/_state/ekonomi/sektor-unggulan-desa';
import colors from '@/con/colors';
import { Box, Button, Paper, Stack, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useProxy } from 'valtio/utils';

function EditSektorUnggulanDesa() {
  const router = useRouter()
  const params = useParams() as { id: string }
  const stateGrafik = useProxy(grafikSektorUnggulan)

  const id = params.id

  // Load data saat komponen mount
  useEffect(() => {
    if (id) {
      stateGrafik.findUnique.load(id).then(() => {
        const data = stateGrafik.findUnique.data
        if (data) {
          stateGrafik.update.form = {
            name: data.name || '',
            description: data.description || '',
            value: data.value || 0,
          }
        }
      })
    }
  }, [id])

  const handleSubmit = async () => {
    // Set the ID before submitting
    stateGrafik.update.id = id;
    await stateGrafik.update.submit();
    router.push('/admin/ekonomi/sektor-unggulan-desa')
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
          <Title order={3}>Edit Sektor Unggulan Desa</Title>
          <TextInput
            label="Nama Sektor Unggulan"
            placeholder="masukkan nama sektor unggulan"
            value={stateGrafik.update.form.name}
            onChange={(val) => {
              stateGrafik.update.form.name = val.currentTarget.value;
            }}
          />
          <TextInput
            label="Deskripsi Sektor Unggulan"
            placeholder="masukkan deskripsi sektor unggulan"
            value={stateGrafik.update.form.description}
            onChange={(val) => {
              stateGrafik.update.form.description = val.currentTarget.value;
            }}
          />
          <TextInput
            label="Jumlah"
            type="number"
            placeholder="masukkan jumlah"
            value={stateGrafik.update.form.value}
            onChange={(val) => {
              stateGrafik.update.form.value = Number(val.currentTarget.value);
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

export default EditSektorUnggulanDesa;
