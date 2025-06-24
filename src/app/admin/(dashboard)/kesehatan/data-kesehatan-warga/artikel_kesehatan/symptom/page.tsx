'use client'
import stateArtikelKesehatan from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/artikelKesehatan';
import colors from '@/con/colors';
import { Box, Paper, Stack, Text, TextInput } from '@mantine/core';
import { useProxy } from 'valtio/utils';
import { KesehatanEditor } from '../../_com/kesehatanEditor';

function SymptomUI() {
  const symptomState = useProxy(stateArtikelKesehatan.symptom)
  return (
    <Box>
      <Paper bg={colors['white-1']} p={'md'}>
        <Stack gap={"xs"}>
          <TextInput
            mb={10}
            label={<Text fw={"bold"}>Judul Gejala Penyakit</Text>}
            placeholder='masukkan judul'
            onChange={(val) => {
              symptomState.create.form.title = val.target.value
            }}
          />
          <KesehatanEditor
            showSubmit={false}
            onChange={(val) => {
              symptomState.create.form.content = val
            }}
          />
        </Stack>
      </Paper>
    </Box>
  );
}

export default SymptomUI;
