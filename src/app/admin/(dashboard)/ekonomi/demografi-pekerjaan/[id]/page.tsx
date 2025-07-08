/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import colors from '@/con/colors';
import { Box, Button, Paper, Stack, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';
import demografiPekerjaan from '../../../_state/ekonomi/demografi-pekerjaan';

function EditDemografiPekerjaan() {
  const router = useRouter()
  const params = useParams() as { id: string }
  const stateDemografi = useProxy(demografiPekerjaan)

  const id = params.id

  useEffect(() => {
    if (!id) return;
    stateDemografi.update.id = id;
    stateDemografi.findUnique.load(id)
      .then(() => {
        const data = stateDemografi.findUnique.data;
        if (data) {
          stateDemografi.update.form = {
            pekerjaan: String(data.pekerjaan || ''),
            lakiLaki: Number(data.lakiLaki || 0),
            perempuan: Number(data.perempuan || 0)
          };
        }
      })
      .catch(error => {
        console.error('Error loading data:', error);
        toast.error('Gagal memuat data');
      });
  }, [id]);

  // Di handleSubmit, ubah menjadi:
  const handleSubmit = async () => {
    try {
      stateDemografi.update.id = id;
      await stateDemografi.update.submit();
      toast.success('Data berhasil diperbarui');
      router.push('/admin/ekonomi/demografi-pekerjaan');
    } catch (error) {
      console.error('Error updating data:', error);
      toast.error('Gagal memperbarui data');
    }
  };

  return (
    <Box>
      <Box mb={10}>
        <Button variant="subtle" onClick={() => router.back()}>
          <IconArrowBack size={20} />
        </Button>
      </Box>
      <Paper bg={colors['white-1']} w={{ base: '100%', md: '50%' }} p={'md'}>
        <Stack>
          <Title order={3}>Edit Demografi Pekerjaan</Title>
          <TextInput
            label="Pekerjaan"
            placeholder="masukkan pekerjaan"
            value={stateDemografi.update.form.pekerjaan}
            onChange={(val) => {
              stateDemografi.update.form.pekerjaan = val.currentTarget.value;
            }}
          />
          <TextInput
            label="Jumlah Pekerja Laki - Laki"
            type="number"
            placeholder="masukkan jumlah pekerja laki - laki"
            value={stateDemografi.update.form.lakiLaki}
            onChange={(val) => {
              stateDemografi.update.form.lakiLaki = Number(val.currentTarget.value);
            }}
          />
          <TextInput
            label="Jumlah Pekerja Perempuan"
            type="number"
            placeholder="masukkan jumlah pekerja perempuan"
            value={stateDemografi.update.form.perempuan}
            onChange={(val) => {
              stateDemografi.update.form.perempuan = Number(val.currentTarget.value);
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

export default EditDemografiPekerjaan;
