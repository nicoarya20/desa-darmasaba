'use client'
import colors from '@/con/colors';
import { Box, Paper, Text } from '@mantine/core';
import { useProxy } from 'valtio/utils';
import stateFasilitasKesehatan from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/fasilitasKesehatan';
import { KesehatanEditor } from '../../_com/kesehatanEditor';

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
