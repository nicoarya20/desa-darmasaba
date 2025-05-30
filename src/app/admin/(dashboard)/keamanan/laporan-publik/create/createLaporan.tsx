import { Box, Stack, Text, TextInput } from '@mantine/core';
import React from 'react';
import { KeamananEditor } from '../../_com/keamananEditor';


function CreateLaporanPublik() {
  return (
    <Box>
      <Stack gap={"xs"}>
        <TextInput
          label={<Text fz={"sm"} fw={"bold"}>Judul Laporan Publik</Text>}
          placeholder="masukkan judul laporan publik"
        />
        <TextInput
          label={<Text fz={"sm"} fw={"bold"}>Tanggal Laporan Publik</Text>}
          placeholder="masukkan tanggal laporan publik"
        />
        <Box>
          <Text fz={"sm"} fw={"bold"}>Deskripsi Laporan Publik</Text>
          <KeamananEditor showSubmit={false} />
        </Box>
      </Stack>
    </Box>
  );
}

export default CreateLaporanPublik;
