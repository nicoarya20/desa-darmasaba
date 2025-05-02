'use client'
import { Box, Text } from '@mantine/core';
import React from 'react';
import { KesehatanEditor } from '../../../_com/kesehatanEditor';
import { useProxy } from 'valtio/utils';
import stateArtikelKesehatan from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/artikelKesehatan';

function DoctorSignUI() {
  const doctorSign = useProxy(stateArtikelKesehatan.doctorSign)
  return (
    <Box>
      <Text fw={"bold"}>Kapan Harus ke Dokter</Text>
      <KesehatanEditor 
      showSubmit={false}
      onChange={(val) => {
        doctorSign.create.form.content = val
      }}
      />
    </Box>
  );
}

export default DoctorSignUI;
