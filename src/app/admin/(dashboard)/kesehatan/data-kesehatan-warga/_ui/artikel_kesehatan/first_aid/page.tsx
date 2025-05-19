'use client'
import { Box, Paper, Stack, Text, TextInput } from '@mantine/core';
import React from 'react';
import { useProxy } from 'valtio/utils';
import stateArtikelKesehatan from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/artikelKesehatan';
import { KesehatanEditor } from '../../../_com/kesehatanEditor';
import colors from '@/con/colors';

function FirstAidUI() {
  const firstAidState = useProxy(stateArtikelKesehatan.firstAid)
  return (
    <Box>
      <Paper bg={colors['white-1']} p={'md'}>
        <Stack gap={"xs"}>
          <TextInput
            label={<Text fw={"bold"}>Judul Pertolongan Pertama</Text>}
            placeholder="Masukkan judul"
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
        </Stack>
      </Paper>
    </Box>
  );
}

export default FirstAidUI;
