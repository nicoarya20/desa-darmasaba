'use client'
import stateArtikelKesehatan from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/artikelKesehatan';
import { Box, Text, TextInput } from '@mantine/core';
import { useProxy } from 'valtio/utils';
import { KesehatanEditor } from '../../../_com/kesehatanEditor';

function SymptomUI() {
  const symptomState = useProxy(stateArtikelKesehatan.symptom)
  return (
    <Box py={10}>
      <TextInput
      mb={10}
        label={<Text fw={"bold"}>Title Gejala Penyakit</Text>}
        placeholder='masukkan title'
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
    </Box>
  );
}

export default SymptomUI;
