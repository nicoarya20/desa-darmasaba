'use client'
import { Box, Paper, Text } from '@mantine/core';
import React from 'react';
import { KesehatanEditor } from '../../../_com/kesehatanEditor';
import { useProxy } from 'valtio/utils';
import stateArtikelKesehatan from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/artikelKesehatan';
import colors from '@/con/colors';

function DoctorSignUI() {
  const doctorSign = useProxy(stateArtikelKesehatan.doctorSign)
  return (
    <Box>
      <Paper bg={colors['white-1']} p={'md'}>
        <Text fw={"bold"}>Kapan Harus ke Dokter</Text>
        <KesehatanEditor
          showSubmit={false}
          onChange={(val) => {
            doctorSign.create.form.content = val
          }}
        />
      </Paper>
    </Box>
  );
}

export default DoctorSignUI;
