import stateFasilitasKesehatan from '@/app/admin/(dashboard)/_state/kesehatan/fasilitasKesehatan';
import { Box, Text, TextInput } from '@mantine/core';
import { useProxy } from 'valtio/utils';

function DokterDanTenagaMedis() {
  const dokterdantenagamedisState = useProxy(stateFasilitasKesehatan.dokterdantenagamedis)
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
    </Box>
  );
}

export default DokterDanTenagaMedis;
