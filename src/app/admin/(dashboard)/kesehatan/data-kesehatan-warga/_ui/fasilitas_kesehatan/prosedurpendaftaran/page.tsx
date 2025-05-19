import stateFasilitasKesehatan from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/fasilitasKesehatan';
import { Box, Text, Paper } from '@mantine/core';
import { useProxy } from 'valtio/utils';
import { KesehatanEditor } from '../../../_com/kesehatanEditor';
import colors from '@/con/colors';

function ProsedurPendaftaran() {
  const prosedurpendaftaranState = useProxy(stateFasilitasKesehatan.prosedurpendaftaran)
  return <Box>
    <Paper bg={colors['white-1']} p={'md'}>
      <Text fw={"bold"}>Prosedur Pendaftaran</Text>
      <KesehatanEditor
        showSubmit={false}
        onChange={(val) => {
          prosedurpendaftaranState.create.form.content = val;
        }} />
    </Paper>
  </Box>

}

export default ProsedurPendaftaran;
