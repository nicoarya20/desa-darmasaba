'use client'
import stateFasilitasKesehatan from '@/app/admin/(dashboard)/_state/kesehatan/fasilitasKesehatan';
import { Box, Text, TextInput } from '@mantine/core';
import { useProxy } from 'valtio/utils';

function InformasiUmum() {
  const infromasiState = useProxy(stateFasilitasKesehatan.informasiumum)
  return<Box>
      <Text fw={"bold"}>Informasi Umum</Text>
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
    </Box>
}

export default InformasiUmum;
