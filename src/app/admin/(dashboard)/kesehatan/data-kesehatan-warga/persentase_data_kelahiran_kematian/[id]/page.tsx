/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import persentasekelahiran from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/persentaseKelahiran';
import colors from '@/con/colors';
import { Box, Button, Paper, Stack, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useProxy } from 'valtio/utils';

function EditPersentaseDataKelahiranKematian() {
  const router = useRouter()
  const params = useParams() as { id: string }
  const statePresentase = useProxy(persentasekelahiran)

  const id = params.id

  // Load data saat komponen mount
  useEffect(() => {
    if (id) {
      statePresentase.findUnique.load(id).then(() => {
        const data = statePresentase.findUnique.data
        if (data) {
          statePresentase.update.form = {
            tahun: data.tahun || '',
            kematianKasar: data.kematianKasar || '',
            kelahiranKasar: data.kelahiranKasar || '',
            kematianBayi: data.kematianBayi || '',
          }
        }
      })
    }
  }, [id])

  const handleSubmit = async () => {
    // Set the ID before submitting
    statePresentase.update.id = id;
    await statePresentase.update.submit();
    router.push('/admin/kesehatan/data-kesehatan-warga/persentase_data_kelahiran_kematian')
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
          <Title order={3}>Edit Persentase Data Kelahiran & Kematian</Title>
          <TextInput
            label="Tahun"
            placeholder="masukkan tahun"
            value={statePresentase.update.form.tahun}
            onChange={(val) => {
              statePresentase.update.form.tahun = val.currentTarget.value;
            }}
          />
          <TextInput
            label="Kematian Kasar"
            type="number"
            placeholder="masukkan kematian kasar"
            value={statePresentase.update.form.kematianKasar}
            onChange={(val) => {
              statePresentase.update.form.kematianKasar = val.currentTarget.value;
            }}
          />
          <TextInput
            label="Kematian Bayi"
            type="number"
            placeholder="masukkan kematian bayi"
            value={statePresentase.update.form.kematianBayi}
            onChange={(val) => {
              statePresentase.update.form.kematianBayi = val.currentTarget.value;
            }}
          />
          <TextInput
            label="Kelahiran Kasar"
            type="number"
            placeholder="masukkan kelahiran kasar"
            value={statePresentase.update.form.kelahiranKasar}
            onChange={(val) => {
              statePresentase.update.form.kelahiranKasar = val.currentTarget.value;
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

export default EditPersentaseDataKelahiranKematian;
