'use client'
import stateArtikelKesehatan from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/artikelKesehatan';
import { Box, Text, TextInput } from '@mantine/core';
import React from 'react';
import { useProxy } from 'valtio/utils';
import { KesehatanEditor } from '../../../_com/kesehatanEditor';

function PreventionUI() {
  const preventionState = useProxy(stateArtikelKesehatan.prevention)
  return (
    <Box py={10}>
      <TextInput
      mb={10}
        label={<Text fw={"bold"}>Title Pencegahan Penyakit</Text>}
        placeholder="Masukkan title"
        onChange={(val) => {
          preventionState.create.form.title = val.target.value
        }}
      />
      <KesehatanEditor
        showSubmit={false}
        onChange={(val) => {
          preventionState.create.form.content = val
        }}
      />
    </Box>
  );
}

export default PreventionUI;
