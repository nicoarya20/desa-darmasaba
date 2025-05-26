'use client'
import stateArtikelKesehatan from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/artikelKesehatan';
import colors from '@/con/colors';
import { Box, Paper, Stack, Text, TextInput } from '@mantine/core';
import { useProxy } from 'valtio/utils';

function MythFactUI() {
  const mythFact = useProxy(stateArtikelKesehatan.mythFact)
  return (
    <Box>
      <Paper bg={colors['white-1']} p={'md'}>
        <Stack gap={"xs"}>
          <TextInput
            label={<Text fw={"bold"}>Judul Pertolongan Pertama Penyakit</Text>}
            placeholder="Masukkan judul"
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
        </Stack>
      </Paper>
    </Box>
  );
}

export default MythFactUI;
