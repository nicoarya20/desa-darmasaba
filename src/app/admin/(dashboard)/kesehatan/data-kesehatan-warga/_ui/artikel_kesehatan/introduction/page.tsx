'use client'
import { Box, Text } from '@mantine/core';
import React from 'react';
import { useProxy } from 'valtio/utils';
import { KesehatanEditor } from '../../../_com/kesehatanEditor';
import stateArtikelKesehatan from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/artikelKesehatan';

function IntoductionUI() {
  const introduction = useProxy(stateArtikelKesehatan.introduction)
  return (
    <Box py={10}>
    <Text fw={"bold"}>Pendahuluan</Text>
    <KesehatanEditor
    showSubmit={false}
    onChange={(val) => {
      introduction.create.form.content = val;
    }}
    />
    </Box>
  );
}

export default IntoductionUI;
