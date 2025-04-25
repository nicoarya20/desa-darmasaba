import { Box, Button, Text, TextInput } from '@mantine/core';
import React from 'react';
import { useProxy } from 'valtio/utils';
import stateKesehatan from '@/app/admin/(dashboard)/_state/kesehatan/kesehatan';

function TarifDanLayanan() {
  const tarifdanlayanan = useProxy(stateKesehatan.tarifdanlayanan)
  return <Box>
  <Text fw={"bold"}>Tarif & Layanan</Text>
  <TextInput
    label="Tarif"
    placeholder='masukkan tarif'
    onChange={(val) => {
      tarifdanlayanan.create.form.tarif = val.target.value
    }}
  />
  <TextInput
  mb={10}
    label="Layanan"
    placeholder='masukkan layanan'
    onChange={(val) => {
      tarifdanlayanan.create.form.layanan = val.target.value
    }}
  />
  <Button
    onClick={() => {
      tarifdanlayanan.create.create()
    }}
  >Simpan</Button>
</Box>
}

export default TarifDanLayanan;
