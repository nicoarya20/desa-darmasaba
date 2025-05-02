'use client'
import { Box, Text, TextInput } from '@mantine/core';
import React from 'react';
import { useProxy } from 'valtio/utils';
import stateArtikelKesehatan from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/artikelKesehatan';
import { KesehatanEditor } from '../../../_com/kesehatanEditor';

function FirstAidUI() {
  const firstAidState = useProxy(stateArtikelKesehatan.firstAid)
  return (
    <Box>
    <TextInput
    label={<Text fw={"bold"}>Title Pertolongan Pertama</Text>}
    placeholder="Masukkan title"
    onChange={(val) => {
      firstAidState.create.form.title = val.target.value
    }}
    /> 
    <KesehatanEditor
    showSubmit={false}
    onChange={(val) => {
      firstAidState.create.form.content = val
    }}
    />
    </Box>
  );
}

export default FirstAidUI;
