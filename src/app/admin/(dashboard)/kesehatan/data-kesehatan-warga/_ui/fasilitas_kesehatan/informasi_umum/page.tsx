'use client'
import stateFasilitasKesehatan from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/fasilitasKesehatan';
import colors from '@/con/colors';
import { Box, Paper, Stack, Text, TextInput } from '@mantine/core';
import { useProxy } from 'valtio/utils';

function InformasiUmum() {
  const infromasiState = useProxy(stateFasilitasKesehatan.informasiumum)
  return <Box>
    <Paper bg={colors['white-1']} p={'md'}>
    <Text fw={"bold"}>Informasi Umum</Text>
      <Stack gap={"xs"}>
        <TextInput
          label="Fasilitas"
          placeholder='masukkan nama fasilitas kesehatan'
          onChange={(val) => {
            infromasiState.create.form.fasilitas = val.target.value
          }}
        />
        <TextInput
          label="Alamat"
          placeholder='masukkan alamat'
          onChange={(val) => {
            infromasiState.create.form.alamat = val.target.value
          }}
        />
        <TextInput
          mb={10}
          label="Jam Operasional"
          placeholder='masukkan jam operasional'
          onChange={(val) => {
            infromasiState.create.form.jamOperasional = val.target.value
          }}
        />
      </Stack>
    </Paper>
  </Box>
}

export default InformasiUmum;
