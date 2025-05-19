'use client'
import { Box, Paper, Stack, Text } from '@mantine/core';
import React from 'react';
import { useProxy } from 'valtio/utils';
import { KesehatanEditor } from '../../../_com/kesehatanEditor';
import stateArtikelKesehatan from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/artikelKesehatan';
import colors from '@/con/colors';

function IntoductionUI() {
  const introduction = useProxy(stateArtikelKesehatan.introduction)
  return (
    <Box>
      <Paper bg={colors['white-1']} p={'md'}>
        <Stack gap={"xs"}>
          <Text fw={"bold"}>Pendahuluan</Text>
          <KesehatanEditor
            showSubmit={false}
            onChange={(val) => {
              introduction.create.form.content = val;
            }}
          />
        </Stack>
      </Paper>
    </Box>
  );
}

export default IntoductionUI;
