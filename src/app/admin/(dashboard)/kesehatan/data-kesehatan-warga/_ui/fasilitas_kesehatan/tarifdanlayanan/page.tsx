import stateFasilitasKesehatan from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/fasilitasKesehatan';
import colors from '@/con/colors';
import { Box, Paper, Stack, Text, TextInput } from '@mantine/core';
import { useProxy } from 'valtio/utils';

function TarifDanLayanan() {
  const tarifdanlayanan = useProxy(stateFasilitasKesehatan.tarifdanlayanan)
  return <Box>
    <Paper bg={colors['white-1']} p={'md'}>
    <Text fw={"bold"}>Tarif & Layanan</Text>
      <Stack gap={"xs"}>
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
      </Stack>
    </Paper>
  </Box>
}

export default TarifDanLayanan;
