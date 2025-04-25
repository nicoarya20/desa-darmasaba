import stateKesehatan from '@/app/admin/(dashboard)/_state/kesehatan/kesehatan';
import { Box, Button, Text, TextInput } from '@mantine/core';
import React from 'react';
import { useProxy } from 'valtio/utils';

function DokterDanTenagaMedis() {
  const dokterdantenagamedisState = useProxy(stateKesehatan.dokterdantenagamedis)
  return (
    <Box>
      <Text fw={"bold"}>Dokter & Tenaga Medis</Text>
      <TextInput
        label="Nama Dokter"
        placeholder='masukkan nama dokter'
        onChange={(val) => {
          dokterdantenagamedisState.create.form.name = val.target.value
        }}
      />
      <TextInput
        label="Specialist"
        placeholder='masukkan specialist'
        onChange={(val) => {
          dokterdantenagamedisState.create.form.specialist = val.target.value
        }}
      />
      <TextInput
      mb={10}
        label="Jadwal"
        placeholder='masukkan jadwal'
        onChange={(val) => {
          dokterdantenagamedisState.create.form.jadwal = val.target.value
        }}
      />
      <Button
        onClick={() => {
          dokterdantenagamedisState.create.create()
        }}>Simpan</Button>
    </Box>
  );
}

export default DokterDanTenagaMedis;
