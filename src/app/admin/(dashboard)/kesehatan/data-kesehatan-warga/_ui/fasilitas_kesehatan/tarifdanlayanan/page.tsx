import stateFasilitasKesehatan from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/fasilitasKesehatan';
import { Box, Text, TextInput } from '@mantine/core';
import { useProxy } from 'valtio/utils';

function TarifDanLayanan() {
  const tarifdanlayanan = useProxy(stateFasilitasKesehatan.tarifdanlayanan)
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
</Box>
}

export default TarifDanLayanan;
