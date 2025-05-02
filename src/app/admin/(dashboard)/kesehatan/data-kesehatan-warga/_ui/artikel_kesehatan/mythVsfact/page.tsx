'use client'
import stateArtikelKesehatan from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/artikelKesehatan';
import { Box, Text, TextInput } from '@mantine/core';
import { useProxy } from 'valtio/utils';

function MythFactUI() {
  const mythFact = useProxy(stateArtikelKesehatan.mythFact)
  return (
    <Box py={10}>
      <TextInput
      label={<Text fw={"bold"}>Title Pertolongan Pertama Penyakit</Text>}
      placeholder="Masukkan title"
      onChange={(val) => {
        mythFact.create.form.title = val.target.value
      }}
      />
      <TextInput
      label={<Text fw={"bold"}>Mitos</Text>}
      placeholder="Masukkan mitos"
      onChange={(val) => {
        mythFact.create.form.mitos = val.target.value
      }}
      />
      <TextInput
      label={<Text fw={"bold"}>Fakta</Text>}
      placeholder="Masukkan fakta"
      onChange={(val) => {
        mythFact.create.form.fakta = val.target.value
      }}
      />
    </Box>
  );
}

export default MythFactUI;
