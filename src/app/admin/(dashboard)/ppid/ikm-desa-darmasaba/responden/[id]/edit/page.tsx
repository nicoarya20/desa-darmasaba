'use client'
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import colors from '@/con/colors';
import { Box, Button, Paper, Stack, Title, TextInput, Text, Select } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import indeksKepuasanState from '@/app/admin/(dashboard)/_state/landing-page/indeks-kepuasan';

function EditResponden() {
  const router = useRouter()
  const params = useParams() as { id: string }
  const state = useProxy(indeksKepuasanState.responden)
  const id = params.id

  useEffect(() => {
    if (id) {
      state.findUnique.load(id).then(() => {
        const data = state.findUnique.data
        if (data) {
          state.update.form = {
            name: data.name || '',
            tanggal: data.tanggal ? new Date(data.tanggal).toISOString() : new Date().toISOString(),
            jenisKelaminId: data.jenisKelaminId || '',
            ratingId: data.ratingId || '',
            kelompokUmurId: data.kelompokUmurId || '',
          }
        }
      })
    }
  }, [id])

  const handleSubmit = async () => {
    state.update.id = id;
    await state.update.submit();
    router.push('/admin/ppid/ikm-desa-darmasaba/responden')
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
          <Title order={3}>Edit Responden</Title>
          <TextInput
            label="Nama"
            type='text'
            placeholder="masukkan nama"
            value={state.update.form.name}
            onChange={(val) => {
              state.update.form.name = val.currentTarget.value;
            }}
          />
          <TextInput
            label="Tanggal"
            type="date"
            placeholder="masukkan tanggal"
            value={state.update.form.tanggal}
            onChange={(val) => {
              state.update.form.tanggal = val.currentTarget.value;
            }}
          />
          <Select
            value={state.update.form.jenisKelaminId}
            onChange={(val) => {
              state.update.form.jenisKelaminId = val || "";
            }}
            label={<Text fw={"bold"} fz={"sm"}>Jenis Kelamin</Text>}
            placeholder='Pilih jenis kelamin'
            data={
              indeksKepuasanState.jenisKelaminResponden.findMany.data?.map((v) => ({
                value: v.id,
                label: v.nama
              })) || []
            }
            clearable
            searchable
            required
            error={!state.update.form.jenisKelaminId ? "Pilih jenis kelamin" : undefined}
          />
           <Select
            value={state.update.form.ratingId}
            onChange={(val) => {
              state.update.form.ratingId = val || "";
            }}
            label={<Text fw={"bold"} fz={"sm"}>Rating</Text>}
            placeholder='Pilih rating'
            data={
              indeksKepuasanState.pilihanRatingResponden.findMany.data?.map((v) => ({
                value: v.id,
                label: v.nama
              })) || []
            }
            clearable
            searchable
            required
            error={!state.update.form.ratingId ? "Pilih rating" : undefined}
          />

          <Select
            value={state.update.form.kelompokUmurId}
            onChange={(val) => {
              state.update.form.kelompokUmurId = val || "";
            }}
            label={<Text fw={"bold"} fz={"sm"}>Kelompok Umur</Text>}
            placeholder='Pilih kelompok umur'
            data={
              indeksKepuasanState.kelompokUmurResponden.findMany.data?.map((v) => ({
                value: v.id,
                label: v.nama
              })) || []
            }
            clearable
            searchable
            required
            error={!state.update.form.kelompokUmurId ? "Pilih kelompok umur" : undefined}
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

export default EditResponden;
