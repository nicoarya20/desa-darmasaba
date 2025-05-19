import stateFasilitasKesehatan from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/fasilitasKesehatan';
import { Box, Paper, Text } from '@mantine/core';
import { useProxy } from 'valtio/utils';
import { KesehatanEditor } from '../../../_com/kesehatanEditor';
import colors from '@/con/colors';

function FasilitasPendukung() {
  const fasilitaspendukungState = useProxy(stateFasilitasKesehatan.fasilitaspendukung)
  return <Box>
    <Paper bg={colors['white-1']} p={'md'}>
      <Text fw={"bold"}>Fasilitas Pendukung</Text>
      <KesehatanEditor
        showSubmit={false}
        onChange={(val) => {
          fasilitaspendukungState.create.form.content = val;
        }} />
    </Paper>
  </Box>
}

export default FasilitasPendukung;
